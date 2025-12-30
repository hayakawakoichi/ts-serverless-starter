import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"
import { Nextjs } from "cdk-nextjs-standalone"
import type { Construct } from "constructs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration from environment variables
const config = {
    // Secret names in AWS Secrets Manager
    dbSecretName: process.env.DB_SECRET_NAME || "ts-serverless-starter/database-url",
    authSecretName: process.env.AUTH_SECRET_NAME || "ts-serverless-starter/auth-secret",
    // Site URL (set after first deployment, then redeploy)
    siteUrl: process.env.SITE_URL || "",
    // Allowed emails for docs access (comma-separated)
    docsAllowedEmails: process.env.DOCS_ALLOWED_EMAILS || "",
}

export class NextjsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Reference secrets by name for granting permissions
        const dbSecret = Secret.fromSecretNameV2(this, "DatabaseSecret", config.dbSecretName)
        const authSecret = Secret.fromSecretNameV2(this, "AuthSecret", config.authSecretName)

        // Next.js deployment using OpenNext
        // Use CloudFormation dynamic references for secret values (resolved at deploy time)
        const nextjs = new Nextjs(this, "NextjsSite", {
            nextjsPath: path.join(__dirname, "../../apps/web"),
            buildCommand: "pnpm build:open-next",
            environment: {
                DATABASE_URL: `{{resolve:secretsmanager:${config.dbSecretName}}}`,
                BETTER_AUTH_SECRET: `{{resolve:secretsmanager:${config.authSecretName}}}`,
                BETTER_AUTH_URL: config.siteUrl,
                NEXT_PUBLIC_APP_URL: config.siteUrl,
                ...(config.docsAllowedEmails && { DOCS_ALLOWED_EMAILS: config.docsAllowedEmails }),
            },
        })

        // Grant secret access to Lambda functions
        const serverFn = nextjs.serverFunction?.lambdaFunction
        if (serverFn) {
            dbSecret.grantRead(serverFn)
            authSecret.grantRead(serverFn)
        }

        // Outputs
        new CfnOutput(this, "CloudFrontDistributionDomain", {
            value: nextjs.distribution?.distributionDomain || "",
            description: "CloudFront Distribution Domain",
        })

        new CfnOutput(this, "SiteUrl", {
            value: `https://${nextjs.distribution?.distributionDomain || ""}`,
            description: "Site URL",
        })
    }
}
