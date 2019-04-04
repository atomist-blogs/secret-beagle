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
    PushImpactResponse,
    SdmContext,
    slackInfoMessage,
    slackWarningMessage,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
} from "@atomist/sdm";
import { createSoftwareDeliveryMachine, } from "@atomist/sdm-core";
import { ExposedSecret, sniffProject } from "./secretSniffing";
import { DefaultSecretDefinitions } from "./defaultSecretDefinitions";

/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "Empty Seed Software Delivery Machine",
        configuration,
    });

    // Goal to react to any push
    const pushImpact = new PushImpact()
        .withListener(sniffForSecrets());

    sdm.withPushRules(
        onAnyPush().itMeans("sniff for secrets").setGoals(pushImpact),
    );

    const secretDefinitions = DefaultSecretDefinitions;

    sdm.addCodeInspectionCommand({
        name: "secretSniffer",
        intent: ["find secrets", "sniff secrets", "release the hound"],
        inspection: async (p, ci) => {
            await ci.addressChannels(`Sniffing project at ${p.id.url} for secrets`);
            const exposedSecrets = await sniffProject(p, { secretDefinitions });
            if (exposedSecrets.length === 0) {
                await ci.addressChannels(slackInfoMessage(p.id.url, "Everything is cool and secure :thumbsup:"));
            } else {
                await renderExposedSecrets(exposedSecrets, ci);
            }
        },
    });
    return sdm;
}

async function renderExposedSecrets(exposedSecrets: ExposedSecret[], sdmc: SdmContext) {
    for (const es of exposedSecrets) {
        await sdmc.addressChannels(slackWarningMessage(es.repoRef.url,
            `Exposed secret: ${es.description} in \`${es.path}\``,
            sdmc.context));
    }
}

/**
 * On every push, scan for secrets
 * @return {PushImpactListener<{}>}
 */
function sniffForSecrets(): PushImpactListener<{}> {
    return async pil => {
        const exposedSecrets = await sniffProject(pil.project, { secretDefinitions: DefaultSecretDefinitions });
        await renderExposedSecrets(exposedSecrets, pil);
        return {
            response: exposedSecrets.length > 0 ?
                PushImpactResponse.failGoals :
                PushImpactResponse.proceed
        };
    };
}
