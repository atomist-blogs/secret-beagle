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

import * as assert from "power-assert";
import { InMemoryProject } from "@atomist/automation-client";
import { sniffFileContent, sniffProject } from "../../lib/machine/machine";

describe("secret sniffing", () => {

    describe("tests project", () => {

        it("finds not secrets in empty project", async () => {
            const p = InMemoryProject.of();
            const exposedSecrets = await sniffProject(p);
            assert.strictEqual(exposedSecrets.length, 0);
        });

        it("doesn't object to innocent JS file in project", async () => {
            const p = InMemoryProject.of({
                path: "evil.js",
                content: "const myString = 'kinder than the Dalai Lama'",
            });
            const exposedSecrets = await sniffProject(p);
            assert.strictEqual(exposedSecrets.length, 0);
        });

        it("finds leaky JS file in project", async () => {
            const p = InMemoryProject.of({
                path: "evil.js",
                content: "const awsLeak = 'AKIAIMW6ASF43DFX57X9'",
            });
            const exposedSecrets = await sniffProject(p);
            assert.strictEqual(exposedSecrets.length, 1);
            assert.strictEqual(exposedSecrets[0].path, "evil.js");
            assert.strictEqual(exposedSecrets[0].secret, "AKIAIMW6ASF43DFX57X9");
            assert.deepStrictEqual(exposedSecrets[0].repoRef, p.id);
        });

    });

    describe("tests file", () => {

        it("doesn't object to innocent JS file", async () => {
            const exposedSecrets = await sniffFileContent(undefined, "evil.js", "const myString = 'kinder than the Dalai Lama'");
            assert.strictEqual(exposedSecrets.length, 0);
        });

        it("finds leaky JS file", async () => {
            const exposedSecrets = await sniffFileContent(undefined, "evil.js", "const awsLeak = 'AKIAIMW6ASF43DFX57X9'");
            assert.strictEqual(exposedSecrets.length, 1);
            assert.strictEqual(exposedSecrets[0].path, "evil.js");
            assert.strictEqual(exposedSecrets[0].secret, "AKIAIMW6ASF43DFX57X9");

        });
    });

});
