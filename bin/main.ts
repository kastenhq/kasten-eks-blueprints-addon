import { App } from '@aws-cdk/core';
import * as ssp from '@aws-quickstart/ssp-amazon-eks';
import { KastenK10AddOn } from '../dist';

const app = new App();

ssp.EksBlueprint.builder()
    .addOns(new ssp.MetricsServerAddOn)
    .addOns(new ssp.ClusterAutoScalerAddOn)
    .addOns(new ssp.addons.SSMAgentAddOn) // needed for AWS internal accounts only
    .addOns(new ssp.SecretsStoreAddOn) // requires to support CSI Secrets
     .addOns(new KastenK10AddOn)
     .build(app, 'kasten-extension-test-blueprint');
