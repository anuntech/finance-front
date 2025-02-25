import https from "https";
import { CONFIGS } from "@/configs";
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
	region: CONFIGS.HETZNER_S3_REGION,
	endpoint: CONFIGS.HETZNER_S3_ENDPOINT,
	credentials: {
		accessKeyId: CONFIGS.HETZNER_S3_ACCESS_KEY_ID,
		secretAccessKey: CONFIGS.HETZNER_S3_SECRET_ACCESS_KEY,
	},
});

export const getS3Image = (uuid: string) => {
	return `${CONFIGS.HETZNER_S3_ENDPOINT}/${CONFIGS.HETZNER_S3_BUCKET_NAME}/${uuid}`;
};
