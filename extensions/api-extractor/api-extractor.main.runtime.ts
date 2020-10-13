import { CLIAspect, MainRuntime, CLIMain } from '@teambit/cli';
import { EnvsAspect, EnvsMain } from '@teambit/environments';
import { LoggerAspect, LoggerMain } from '@teambit/logger';
import { Workspace, WorkspaceAspect } from '@teambit/workspace';
import { GraphqlAspect, GraphqlMain } from '@teambit/graphql';

import * as tmp from 'tmp';
import * as path from 'path';

import { ApiExtractorAspect } from './api-extractor.aspect';
import { DocCmd } from './doc.cmd';
import { apiExtractorSchema } from './api-extractor.graphql';
import { ApiExtractorService } from './api-extractor.service';
import { ApiExtractorTask } from './api-extractor.task';
import { generateDocsForComponent } from './generate-docs';
import { requireJsonWithComments } from './utils';

export class ApiExtractorMain {
  constructor(
    /**
     * envs extension.
     */
    private envs: EnvsMain,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * tester service.
     */
    readonly service: ApiExtractorService,

    /**
     * build task.
     */
    readonly task: ApiExtractorTask
  ) {}

  // For GraphQL resolver
  public async generateComponentDocsByComponentID(componentID) {
    const componentPaths = this.workspace.componentDir(componentID);
    const componentName = path.basename(componentPaths);
    const onOutput = (e, msg) => {
      e ? console.error(msg, e) : console.log(msg);
    };

    // Creating temp Docs folder
    const tmpobj = tmp.dirSync({ prefix: 'dev.bit.docs.apidocs-', keep: false, unsafeCleanup: true });
    const tempComponentDocsOutputFolder = path.join(tmpobj.name, '__tempDocsOutputFolder__', componentName);

    try {
      const resultsLocation = await generateDocsForComponent(
        componentPaths,
        tempComponentDocsOutputFolder,
        onOutput,
        false
      );

      const results = {
        componentName: resultsLocation.componentName,
        apiJsonFileJSON: requireJsonWithComments(resultsLocation.apiJsonFilePath),
        tsdocMetadataFileJSON: requireJsonWithComments(resultsLocation.tsdocMetadataFilePath),
      };

      //cleanup
      tmpobj.removeCallback();

      return results;
    } catch (err) {
      tmpobj.removeCallback();
      throw err;
    }
  }

  // For CLI
  public async generateDocsForWorkspace(onOutput: (e, msg) => void, reportOutputPath) {
    // Get Components Directory
    let componentsList = await this.workspace.list();
    let componentsPathsList = componentsList.map((comp) => this.workspace.componentDir(comp.id));

    console.log(`Start generating api docs for ${componentsPathsList.length} components`);

    componentsPathsList.map((componentPath) => {
      const componentName = path.basename(componentPath);
      const componentReportOutputPath = path.join(reportOutputPath, componentName);
      return generateDocsForComponent(componentPath, componentReportOutputPath, onOutput, true);
    });
  }

  static runtime = MainRuntime;
  static dependencies = [CLIAspect, EnvsAspect, WorkspaceAspect, LoggerAspect, GraphqlAspect];

  static async provider([cli, envs, workspace, loggerAspect, graphql]: [
    CLIMain,
    EnvsMain,
    Workspace,
    LoggerMain,
    GraphqlMain
  ]) {
    const logger = loggerAspect.createLogger(ApiExtractorAspect.id);

    const apiExtractor = new ApiExtractorMain(
      envs,
      workspace,
      new ApiExtractorService(workspace, logger),
      new ApiExtractorTask(ApiExtractorAspect.id)
    );

    cli.register(new DocCmd(apiExtractor, workspace, logger));

    const _apiExtractorSchema = apiExtractorSchema(apiExtractor);
    graphql.register(_apiExtractorSchema);
    return apiExtractor;
  }
}

ApiExtractorAspect.addRuntime(ApiExtractorMain);
