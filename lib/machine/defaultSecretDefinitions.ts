import { SecretDefinition } from "./secretSniffing";

/**
 * Note that all regexes must be global
 * @type {any[]}
 */
export const DefaultSecretDefinitions: SecretDefinition[] = [
    {
        pattern: /AKIA[0-9A-Z]{16}/g,
        description: "AWS secret",
    },
];