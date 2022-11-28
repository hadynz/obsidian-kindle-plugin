import type { AmazonAccountRegion, SyncMode } from '~/models';
import defaultBookTemplate from '~/rendering//templates/bookTemplate.njk';
import defaultHighlightTemplate from '~/rendering/templates/defaultHighlightTemplate.njk';
import headingTemplate from '~/rendering/templates/headingTemplate.njk';
import highlightTemplateWrapper from '~/rendering/templates/highlightTemplateWrapper.njk';

type GlobalConfig = {
  defaultTemplates: {
    fileName: string;
    file: string;
    header: string;
    highlight: string;
    highlightWrapper: string;
  };
  amazonRegion: AmazonAccountRegion;
  highlightsFolder: string;
  lastSyncMode: SyncMode;
};

const globalConfig: GlobalConfig = {
  defaultTemplates: {
    fileName: '{{authorsLastNames}}-{{title}}',
    file: defaultBookTemplate,
    header: headingTemplate,
    highlight: defaultHighlightTemplate,
    highlightWrapper: highlightTemplateWrapper,
  },
  amazonRegion: 'global',
  highlightsFolder: '/',
  lastSyncMode: 'amazon',
};

export default globalConfig;
