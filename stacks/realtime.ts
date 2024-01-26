import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnAuthorizer } from "aws-cdk-lib/aws-iot";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Function, StackContext, use } from "sst/constructs";
import { auth as authStack } from "./auth";
import { config as configStack } from "./config";

export function realtime(ctx: StackContext) {
  const auth = use(authStack);
  const config = use(configStack);

  const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
    functionName: ctx.app.logicalPrefixedName("authorizer"),
    handler: "packages/functions/src/auth-iot.handler",
    bind: [
      auth,
      config.parameters.DATABASE_HOST,
      config.secrets.DATABASE_USERNAME,
      config.secrets.DATABASE_PASSWORD,
    ],
    permissions: ["iot"],
  });

  const authorizer = new CfnAuthorizer(ctx.stack, "authorizer", {
    status: "ACTIVE",
    authorizerName: ctx.app.logicalPrefixedName("authorizer"),
    authorizerFunctionArn: authorizerFn.functionArn,
    signingDisabled: true,
  });

  authorizerFn.addPermission("iot-permission", {
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: authorizer.attrArn,
    action: "lambda:InvokeFunction",
  });

  const describeEndpointRole = new Role(ctx.stack, "describe-endpoint-role", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
  });

  describeEndpointRole.addManagedPolicy(
    ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AWSLambdaBasicExecutionRole",
    ),
  );

  describeEndpointRole.addToPolicy(
    new PolicyStatement({
      resources: ["*"],
      actions: ["iot:DescribeEndpoint"],
    }),
  );

  const describeEndpointSdkCall: AwsSdkCall = {
    service: "Iot",
    action: "describeEndpoint",
    parameters: { endpointType: "iot:Data-ATS" },
    region: ctx.stack.region,
    physicalResourceId: PhysicalResourceId.of("IoTEndpointDescription"),
  };

  const describeEndpointResource = new AwsCustomResource(
    ctx.stack,
    "Resource",
    {
      onCreate: describeEndpointSdkCall,
      onUpdate: describeEndpointSdkCall,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      role: describeEndpointRole,
    },
  );

  return {
    endpointAddress:
      describeEndpointResource.getResponseField("endpointAddress"),
  };
}
