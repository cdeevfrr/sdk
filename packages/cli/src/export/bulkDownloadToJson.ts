import { createApiClientWithApiKey, getApiBaseUrl } from "@jupiterone/integration-sdk-runtime";
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { Entity, Relationship } from "@jupiterone/integration-sdk-core";

import { ensureDirectoryExists, writeFileToPath } from "../fileSystem";
import path from "path";
import { sanitizeContent } from "./util";

const J1_ENDPOINT = getApiBaseUrl();

interface BulkEntitiesData {
  items: Entity[],
  endCursor?: string
}

interface BulkRelationshipsData {
  items: Relationship[],
  endCursor?: string
}

async function exportAssetGroupToJson(assetPath: string, objects: Entity[] | Relationship[]) {
  const groups = _.groupBy(objects, '_type')
  await Promise.all(Object.keys(groups).map(async (type) => {
    const group = groups[type];
    const groupTypePath = path.join(assetPath, type);

    await writeFileToPath({ filePath: path.join(groupTypePath, `${uuid()}.json`), content: sanitizeContent(JSON.stringify(group)) })
  }));
}

export type BulkDownloadParams = {
  assetType: 'entities' | 'relationships';
  storageDirectory: string;
  apiKey: string;
  includeDeleted: boolean;
  progress: (totalDownloaded: number) => void
}

export async function bulkDownloadToJson({ storageDirectory, assetType, apiKey, includeDeleted, progress }: BulkDownloadParams) {
  let endCursor: string | undefined;
  let assetCount = 0;

  const apiClient = createApiClientWithApiKey({ apiBaseUrl: J1_ENDPOINT, apiKey });

  const assetPath = path.join(storageDirectory, 'json', assetType);
  await ensureDirectoryExists(assetPath);

  do {
    const { data } = await apiClient.get<BulkEntitiesData | BulkRelationshipsData>(`/${assetType}?includeDeleted=${includeDeleted}${endCursor ? '&cursor=' + endCursor : ''}`);

    await exportAssetGroupToJson(assetPath, data.items);

    endCursor = data.endCursor;
    assetCount += data.items.length;

    progress(assetCount);
  } while (endCursor)
}
