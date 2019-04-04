import { AllFiles, Project, projectUtils, RepoRef } from "@atomist/automation-client";
import * as _ from "lodash";

export interface ExposedSecret {

    repoRef: RepoRef;

    /**
     * File path within project
     */
    path: string;

    secret: string;

    description: string;

    // TODO add source location extraction
}

export interface SnifferOptions {

    secretDefinitions: SecretDefinition[];
}

/**
 * Sniff this project for exposed secrets.
 * Open every file.
 * @param {Project} project
 * @return {ExposedSecret[]}
 */
export async function sniffProject(project: Project, opts: SnifferOptions): Promise<ExposedSecret[]> {
    return _.flatten(await projectUtils.gatherFromFiles(project, AllFiles, async f => {
        return sniffFileContent(project.id, f.path, await f.getContent(), opts);
    }));
}

export interface SecretDefinition {
    pattern: RegExp,
    description: string;
}

export async function sniffFileContent(repoRef: RepoRef, path: string, content: string, opts: SnifferOptions): Promise<ExposedSecret[]> {
    const exposedSecrets: ExposedSecret[] = [];
    for (const pat of opts.secretDefinitions) {
        if (!pat.pattern.flags.includes("g")) {
            throw new Error("All regexes must be global: Found " + pat.pattern.source);
        }
        const matches = content.match(pat.pattern) || [];
        matches.forEach(m => exposedSecrets.push(({
            repoRef,
            path,
            description: pat.description,
            secret: m,
        })));
    }
    return exposedSecrets;
}
