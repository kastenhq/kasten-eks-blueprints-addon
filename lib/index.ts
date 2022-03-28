import * as iam from "@aws-cdk-lib/aws-iam";
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';
import { ServiceAccount } from '@aws-cdk-lib/aws-eks';
import { KastenEC2IamPolicy } from "./iam-policy";


export interface KastenK10AddOnProps {
    /**
     * Helm chart repository.
     * Defaults to the official repo URL.
     */
    repository?: string;

    /**
     * Release name.
     * Defaults to 'k10'.
     */
    release?: string;

    /**
     * Chart name.
     * Defaults to 'k10'.
     */
    chart?: string;

    /**
     * Helm chart version
     */
    version?: string;

    /**
     * Namespace for the add-on.
     */
    namespace?: string;

    /**
     * Kubernetes cluster name.
     */
    clusterName?: string;
    
    /**
     * Defaults to 'kasten'
     */
    name?: string;
    
    /**
     * serviceAccount name.
     */
    serviceAccount?: string;
}



/**
 * Properties available to configure Kasten K10.
 * namespace default is kasten-io
 * version default is 4.5.12
 * values as per https://docs.kasten.io
 */
const defaultProps: KastenK10AddOnProps = {
    name: 'kasten',
    release: 'k10',
    namespace: 'kasten-io',
    chart: 'k10',
    repository: "https://charts.kasten.io/",
    version: '4.5.12',
    serviceAccount: '',
}

export class KastenK10AddOn implements blueprints.ClusterAddOn  {

   // private options: KastenK10AddOnProps;

    readonly options: KastenK10AddOnProps;

    constructor(props?: KastenK10AddOnProps) {
      this.options = { ...defaultProps, ...props };
    }

    deploy(clusterInfo: blueprints.ClusterInfo): Promise<Construct> {
        const props = this.options;
        const cluster = clusterInfo.cluster;

        // Create namespace.
        const ns = blueprints.utils.createNamespace(props.namespace!, clusterInfo.cluster, true);

        //Create Service Account
        const sa = clusterInfo.cluster.addServiceAccount('k10-blueprint-sa', {
            name: 'k10-blueprint-sa',
            namespace: props.namespace
        });

        //Populate Service Account with Input from iam-policy.ts
        KastenEC2IamPolicy.Statement.forEach((statement) => {
            sa.addToPrincipalPolicy(iam.PolicyStatement.fromJson(statement));
        });

         sa.node.addDependency(ns);

    const KastenK10HelmChart = clusterInfo.cluster.addHelmChart('k10', {
      chart: props.chart!,
      release: props.release,
      repository: props.repository,
      namespace: props.namespace,
      version: props.version,
      values: {
         serviceAccount: {
            create: false,
            name: 'k10-blueprint-sa'
         }
      },
    });



        KastenK10HelmChart.node.addDependency(sa);

        return Promise.resolve(KastenK10HelmChart);
    }


}
