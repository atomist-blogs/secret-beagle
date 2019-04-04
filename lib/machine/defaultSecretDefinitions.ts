import { SecretDefinition } from "./secretSniffing";

/**
 * Based on regular expressions in https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_04B-3_Meli_paper.pdf
 * @type {any[]}
 */
export const DefaultSecretDefinitions: SecretDefinition[] = [
    {
        pattern: /AKIA[0-9A-Z]{16}/g,
        description: "AWS secret",
    },
];