import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { CfnOutput, Duration, Stack, type StackProps } from "aws-cdk-lib"
import { CorsHttpMethod, HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2"
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations"
// biome-ignore lint/suspicious/noShadowRestrictedNames: AWS CDK standard naming
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda"
import { RetentionDays } from "aws-cdk-lib/aws-logs"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"
import type { Construct } from "constructs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Database URL from Secrets Manager
        const dbSecret = Secret.fromSecretNameV2(
            this,
            "DatabaseSecret",
            "ts-serverless-starter/database-url"
        )

        // Lambda function (Lambdalith)
        const apiHandler = new Function(this, "ApiHandler", {
            runtime: Runtime.NODEJS_20_X,
            handler: "index.handler",
            code: Code.fromAsset(path.join(__dirname, "../../apps/api/dist"), {
                bundling: {
                    image: Runtime.NODEJS_20_X.bundlingImage,
                    command: ["bash", "-c", "cp -r /asset-input/* /asset-output/"],
                },
            }),
            memorySize: 512,
            timeout: Duration.seconds(30),
            environment: {
                NODE_ENV: "production",
            },
            logRetention: RetentionDays.ONE_WEEK,
        })

        // Grant secret access
        dbSecret.grantRead(apiHandler)

        // HTTP API Gateway
        const httpApi = new HttpApi(this, "HttpApi", {
            apiName: "ts-serverless-starter-api",
            corsPreflight: {
                allowOrigins: ["*"],
                allowMethods: [
                    CorsHttpMethod.GET,
                    CorsHttpMethod.POST,
                    CorsHttpMethod.PUT,
                    CorsHttpMethod.DELETE,
                    CorsHttpMethod.OPTIONS,
                ],
                allowHeaders: ["Content-Type", "Authorization"],
            },
        })

        // Lambda integration
        const lambdaIntegration = new HttpLambdaIntegration("LambdaIntegration", apiHandler)

        // Catch-all route for Lambdalith
        httpApi.addRoutes({
            path: "/{proxy+}",
            methods: [HttpMethod.ANY],
            integration: lambdaIntegration,
        })

        // Root route
        httpApi.addRoutes({
            path: "/",
            methods: [HttpMethod.ANY],
            integration: lambdaIntegration,
        })

        // Outputs
        new CfnOutput(this, "ApiEndpoint", {
            value: httpApi.apiEndpoint,
            description: "HTTP API endpoint URL",
        })

        new CfnOutput(this, "LambdaFunctionName", {
            value: apiHandler.functionName,
            description: "Lambda function name",
        })
    }
}
