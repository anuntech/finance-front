import https from "https";
import { CONFIGS } from "@/configs";
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
	region: CONFIGS.ENVS.HETZNER_S3_REGION,
	endpoint: CONFIGS.ENVS.HETZNER_S3_ENDPOINT,
	credentials: {
		accessKeyId: CONFIGS.ENVS.HETZNER_S3_ACCESS_KEY_ID,
		secretAccessKey: CONFIGS.ENVS.HETZNER_S3_SECRET_ACCESS_KEY,
	},
});

export const getS3Image = (uuid: string) => {
	return `${CONFIGS.ENVS.HETZNER_S3_ENDPOINT}/${CONFIGS.ENVS.HETZNER_S3_BUCKET_NAME}/${uuid}`;
};
