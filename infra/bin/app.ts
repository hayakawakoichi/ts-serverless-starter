#!/usr/bin/env node
import { App } from "aws-cdk-lib"
import { NextjsStack } from "../lib/nextjs-stack"

const app = new App()

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "ap-northeast-1",
}

new NextjsStack(app, "TsServerlessStarterWeb", {
    env,
    description: "ts-serverless-starter Next.js Stack",
})
