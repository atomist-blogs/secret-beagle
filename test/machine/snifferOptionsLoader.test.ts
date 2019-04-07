import { loadSnifferOptions } from "../../lib/machine/snifferOptionsLoader";
import * as assert from "assert";

describe("YAML loader", () => {

    it("loads scan only", async () => {
        const so = await loadSnifferOptions();
        assert.strictEqual(so.scanOnlyChangedFiles, false);
    });

});