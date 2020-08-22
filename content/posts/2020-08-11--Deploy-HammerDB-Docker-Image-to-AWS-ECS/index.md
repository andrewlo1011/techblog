---
title: Deploy a HammerDB Docker Image to AWS ECS
subTitle: HammerDB to AWS ECS
category: "AWS"
cover: AWS_ECS.png
---

## Push the HammerDB Image to Docker Hub
Create a [docker hub account](https://hub.docker.com/signup) and [repository](https://docs.docker.com/docker-hub/repos/#creating-repositories) if you don't have.


Run following command to tag the hammerdb image and push to docker hub a public repository. 

P.S. Please replace my repository with your repository

```
docker tag hammerdb andrewlo1011/hammerdb
docker push andrewlo1011/hammerdb
```
![](./10_push_image_to_docker_hub.jpg)

## Create ECS Cluster
__NOTE: We will create AWS resources that incur costs. It is chargeable, please be aware.__

Create an ECS cluster as below:

![](./20_Create_ECS_cluster.jpg)

Pick the Fargate ECS type, which don't need to maintain our own EC2.
It is kind of serverless ECS.

![](./21_Create_ECS_cluster.jpg)

Enable Container Insights for CPU usage monitoring. 
![](./22_Create_ECS_cluster.jpg)

![](./24_Create_ECS_cluster.jpg)
![](./25_Create_ECS_cluster.jpg)

## Create Task and Container definition

Select Fargate launch type:
![](./26_Create_task_definition.jpg)
![](./40_task_definition.jpg)

Task Size: 2 vCPU and 4G Memory
![](./41_task_definition_b.jpg)

Add the hammerdb Container from docker hub to the definition:
![](./30_add_container_b.jpg)

Add the environment variables for Oracle easy connection string, database username and password: 
![](./31_add_container_b.jpg)

![](./32_add_container.jpg)

Add the awslog configuration, so that we could view the log in CloudWatch.
![](./33_add_container.jpg)

Continue to create task definition:
![](./42_task_definition.jpg)
![](./43_task_definition.jpg)


## Run the hammerdb Task definition

![](./50_run_task.jpg)
![](./51_run_task.jpg)

In the environment variables override, set the Oracle RDS connection string, system username and password.

P.S. 
The step to create the testing RDS Oracle database is not included here.
Also the HammerDB user creation and warehouse build in the database also not included here.

![](./52_run_task.jpg)
![](./53_run_task.jpg)
![](./54_run_task.jpg)
![](./55_run_task.jpg)
![](./56_run_task.jpg)
![](./57_run_task.jpg)

## Round 1 Task Execution Result
The round 1 test was executed with 1, 2, 3 virtual users respectively.
However, after review the database statistic for 3 virtual users, I found that the database loading was a bit low. 
After review, I found that load.tcl has an typo for the 3rd part of the test, it was set to 1 virtual user.

![](./60_run_task_stats.jpg)
![](./61_run_task_stats.jpg)
![](./62_run_task_stats.jpg)
![](./63_run_task_stats.jpg)
![](./64_run_task_stats.jpg)
![](./65_run_task_stats.jpg)
![](./66_run_task_stats.jpg)
![](./67_run_task_stats.jpg)
![](./68_run_task_stats.jpg)

## Round 2 Task Execution Result
I fixed the load.tcl script and increased the virtual users in the script.
I rebuilt the image and push to docker hub again.
The round 2 test was executed with 3, 4, 5 virtual users 
It seems that the current RDS sizing the performance was saturated at 3 virtual users. 

![](./70_run_task_stats.jpg)
![](./71_run_task_stats.jpg)
![](./72_run_task_stats.jpg)
![](./73_run_task_stats.jpg)
![](./74_run_task_stats.jpg)
![](./75_run_task_stats.jpg)
![](./76_run_task_stats.jpg)
![](./77_run_task_stats.jpg)
![](./78_run_task_stats.jpg)