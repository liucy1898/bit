import * as path from 'path';
import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
  IExtractorConfigPrepareOptions,
  ExtractorLogLevel,
} from '@microsoft/api-extractor';

export type ExtractApiFormDTSFilesOptions = {
  rootDtsFilePaths: string;
  componentDirPath: string;
  outputDirPath: string;
  onOutput: (e, msg) => void;
  generateMarkdownReports: boolean;
};

export const extractApiFromComponentDTSFiles = (options: ExtractApiFormDTSFilesOptions) => {
  const apiExtractorJsonPath: string = path.join(__dirname, '../config/api-extractor.json'); // Due to a Bug
  const packageJsonPath = path.join(__dirname, '../config/_package.json'); // Due to a Bug
  const componentName = path.basename(options.componentDirPath);

  // output files paths
  const apiJsonFilePath = path.join(options.outputDirPath, `${componentName}.api.json`);
  const tsdocMetadataFilePath = path.join(options.outputDirPath, `tsdoc-metadata.json`);

  // Load Api-Extractor configurations
  let configFile = ExtractorConfig.loadFile(apiExtractorJsonPath);
  configFile.mainEntryPointFilePath = options.rootDtsFilePaths;
  configFile.docModel.apiJsonFilePath = apiJsonFilePath;
  configFile.tsdocMetadata.tsdocMetadataFilePath = tsdocMetadataFilePath;

  if (options.generateMarkdownReports) {
    configFile.apiReport.enabled = true;
    configFile.apiReport.reportFileName = `${componentName}.api.md`;
    configFile.apiReport.reportFolder = options.outputDirPath;
    configFile.apiReport.reportTempFolder = options.outputDirPath;
  }

  // TODO after the api-extractor bug fixe - Configure messaging level.
  const extractorConfigPrepareOptions: IExtractorConfigPrepareOptions = {
    configObject: configFile,
    configObjectFullPath: apiExtractorJsonPath,
    packageJsonFullPath: packageJsonPath,
    projectFolderLookupToken: options.componentDirPath,
  };

  let extractorConfig: ExtractorConfig = ExtractorConfig.prepare(extractorConfigPrepareOptions);

  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: false,
  });

  if (extractorResult.succeeded) {
    options.onOutput(null, `API Extractor completed successfully`);
  } else {
    const msg =
      `API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`;
    options.onOutput(extractorResult, msg);
  }

  return {
    componentName,
    tsdocMetadataFilePath,
    apiJsonFilePath,
  };
};
