/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    onAnyPush,
    PushImpact,
    PushImpactListener,
    SdmContext,
    slackInfoMessage,
    slackWarningMessage,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
} from "@atomist/sdm";
import { createSoftwareDeliveryMachine, } from "@atomist/sdm-core";
import { ExposedSecret, SnifferOptions, sniffProject } from "./secretSniffing";
import { loadSnifferOptions } from "./snifferOptionsLoader";

/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export async function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): Promise<SoftwareDeliveryMachine> {

    const sdm = createSoftwareDeliveryMachine({
        name: "Software Delivery Machine to find exposed secrets in any project",
        configuration,
    });

    const snifferOptions = await loadSnifferOptions();

    // Goal to react to any push
    const pushImpact = new PushImpact()
        .withListener(sniffForSecretsOnPush(snifferOptions));

    sdm.withPushRules(
        onAnyPush().itMeans("sniff for secrets").setGoals(pushImpact),
    );

    sdm.addCodeInspectionCommand({
        name: "secretSniffer",
        intent: ["find secrets", "sniff secrets", "release the hound"],
        inspection: async (p, ci) => {
            await ci.addressChannels(`Sniffing project at ${p.id.url} for secrets`);
            const sniffed = await sniffProject(p, snifferOptions);
            await ci.addressChannels(`Sniffed ${sniffed.filesSniffed} files in project at ${p.id.url} in ${sniffed.timeMillis} milliseconds`);
            if (sniffed.exposedSecrets.length === 0) {
                await ci.addressChannels(slackInfoMessage(p.id.url, "Everything is cool and secure :thumbsup:"));
            } else {
                await renderExposedSecrets(sniffed.exposedSecrets, ci);
            }
        },
    });
    return sdm;
}

async function renderExposedSecrets(exposedSecrets: ExposedSecret[], sdmc: SdmContext) {
    for (const es of exposedSecrets) {
        await sdmc.addressChannels(slackWarningMessage(es.repoRef.url + " sha:" + es.repoRef.sha,
            `Exposed secret: ${es.description} in \`${es.path}\``,
            sdmc.context));
    }
}

/**
 * On every push, scan for secrets
 * @return {PushImpactListener<{}>}
 */
function sniffForSecretsOnPush(opts: SnifferOptions): PushImpactListener {
    return async pil => {
        const sniffed = await sniffProject(
            opts.scanOnlyChangedFiles ? pil.impactedSubProject : pil.project,
            opts);
        await renderExposedSecrets(sniffed.exposedSecrets, pil);
    };
}
