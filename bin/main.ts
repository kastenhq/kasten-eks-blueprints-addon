import { App } from '@aws-cdk/core';
import * as ssp from '@aws-quickstart/ssp-amazon-eks';
import { KastenK10AddOn } from '@kastenhq/kasten-aws-quickstart';

const app = new App();

ssp.EksBlueprint.builder()
    .addOns(new ssp.MetricsServerAddOn)
    .addOns(new ssp.ClusterAutoScalerAddOn)
    .addOns(new ssp.addons.SSMAgentAddOn) // needed for AWS internal accounts only
    .addOns(new ssp.SecretsStoreAddOn) // requires to support CSI Secrets
     .addOns(new KastenK10AddOn)
     .build(app, 'my-extension-test-blueprint');
