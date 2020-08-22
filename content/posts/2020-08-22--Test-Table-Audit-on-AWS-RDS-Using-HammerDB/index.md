---
title: Test Table Audit on AWS RDS Using HammerDB
subTitle: AWS Oracle RDS Performance
category: "AWS"
cover: hammerdb_rds.jpg
---

After several preparation steps as below, it's time to bring it all together:
1. [Create a HammerDB Docker Image with Oracle Driver](https://drew.vip/Create-a-HammerDB-Docker-Image-with-Oracle-Driver/)
2. [Deploy a HammerDB Docker Image to AWS ECS](https://drew.vip/Deploy-HammerDB-Docker-Image-to-AWS-ECS/)
3. [Setup a Testing AWS RDS Oracle Database](https://drew.vip/Setup-HammerDB-Testing-AWS-RDS-Oracle-Database/)

We ran HammerDB on AWS RDS with Oracle built-in table audit, here was the testing result.

## Test round 1,  db.t3.xlarge, General Purpose SSD

Database Configuration:
1. db.t3.xlarge (4 vCPU, 16G RAM)
2. General Purpose SSD (50G)

![](./Round3/01_database_config.jpg)

![](./Round3/02_database_config.jpg)

ECS Fargate:
![](./Round3/10_ECS_Seting.jpg)

__Test Result:__

Ran the test with 2, 4 and 6 virtual users
![](./Round3/20_baseline_result.jpg)

The system quickly saturated at 6 virtual users.

| Virtual Users   | NOPM  |
| ---------- | ---------- | 
| 2 VU       |  23838     |
| 4 VU       |  28243     |
| 6 VU       |  39273     |

![](./Round3/21_baseline_result.jpg)

__Database and ECS Statistic:__

![](./Round3/22_baseline_result.jpg)
![](./Round3/23_baseline_result.jpg)
![](./Round3/24_baseline_result.jpg)

## Baseline test,  db.t3.2xlarge, Provisioned IOPS SSD

1. db.t3.2xlarge (8 vCPU, 32G RAM)
2. Provisioned IOPS SSD (20000 IOPS, 400G)

P.S. 
Convert from General Purpose SSD (50G) to Provisioned IOPS SSD (20000 IOPS, 400G) took around an hour. 
Provisioned IOPS SSD was quite expensive and I were busy at the time it just completed the conversion. At the end, I terminated the original instance after convert to Provisioned IOPS SSD and rebuilt the instance with db.t3.2xlarge at a later time.


![](./00_database_config.jpg)

![](./01_database_config.jpg)


__Baseline Test Result:__

Ran the test with 2, 4 and 6 virtual users
No bottleneck was observed for this run.

| Virtual Users   | NOPM  |
| ---------- | ---------- | 
| 2 VU       |  26824     |
| 4 VU       |  50513     |
| 6 VU       |  69078     |

![](./10_baseline_result.jpg)
![](./11_baseline_result.jpg)

__Database and ECS Statistic:__
![](./12_baseline_result.jpg)
![](./13_baseline_result.jpg)
![](./14_baseline_result.jpg)
![](./15_baseline_result.jpg)


## Audit Select on TPCC Tables,  db.t3.2xlarge, Provisioned IOPS SSD

1. db.t3.2xlarge (8 vCPU, 32G RAM)
2. Provisioned IOPS SSD (20000 IOPS, 400G)

Before ran the test, enabled audit on TPCC tables as below:

```
NOAUDIT POLICY dml_policy;
DROP AUDIT POLICY dml_policy ;
CREATE AUDIT POLICY dml_policy ACTIONS 
    select on TPCC.CUSTOMER,
    select on TPCC.DISTRICT,
    select on TPCC.HISTORY,
    select on TPCC.ITEM,
    select on TPCC.WAREHOUSE,
    select on TPCC.STOCK,
    select on TPCC.ORDERS,
    select on TPCC.NEW_ORDER,
    select on TPCC.ORDER_LINE;
    
AUDIT policy dml_policy;
```


__Test Result:__
Ran the test with 2, 4 and 6 virtual users.

We only achieved around 38%-30% of baseline test with same configuration:

| Virtual Users   | NOPM  |
| ---------- | ---------- | 
| 2 VU       |  10116     |
| 4 VU       |  17370     |
| 6 VU       |  20443     |

![](./30_database_config.jpg)
![](./31_database_config.jpg)

__Database and ECS Statistic:__

We didn't fully utilize either the CPU or IOPS, however, the overall result was significantly impacted as well. 
![](./32_database_config.jpg)
![](./33_database_config.jpg)
![](./34_database_config.jpg)
![](./35_database_config.jpg)


## Audit All on TPCC Tables,  db.t3.2xlarge, Provisioned IOPS SSD

1. db.t3.2xlarge (8 vCPU, 32G RAM)
2. Provisioned IOPS SSD (20000 IOPS, 400G)

Before ran the test, enabled audit on TPCC tables as below:

```
NOAUDIT POLICY dml_policy;
DROP AUDIT POLICY dml_policy ;
CREATE AUDIT POLICY dml_policy ACTIONS 
    all on TPCC.CUSTOMER,
    all on TPCC.DISTRICT,
    all on TPCC.HISTORY,
    all on TPCC.ITEM,
    all on TPCC.WAREHOUSE,
    all on TPCC.STOCK,
    all on TPCC.ORDERS,
    all on TPCC.NEW_ORDER,
    all on TPCC.ORDER_LINE;
    
AUDIT policy dml_policy;
```


__Test Result:__

Ran the test with 2, 4 and 6 virtual users.

We only achieved around 24%-19% of baseline test with same configuration:

| Virtual Users   | NOPM  |
| ---------- | ---------- | 
| 2 VU       |  6384     |
| 4 VU       |  10519     |
| 6 VU       |  12785     |

![](./20_database_config.jpg)
![](./21_database_config.jpg)

__Database and ECS Statistic:__

We didn't fully utilize either the CPU or IOPS, however, the overall result was significantly impacted. 
![](./22_database_config.jpg)
![](./23_database_config.jpg)
![](./24_database_config.jpg)
![](./25_database_config.jpg)


## Conclusion and Observation:

![](./summary.jpg)

1. We could built a testing environment very quickly in AWS RDS and the platform was far better than my single PC running database on Virtual Box.
2. The RDS cost for this testing was around USD30, the cost of Provisioned IOPS SSD contributed to a major portion of the cost. I terminated the instance right after testing in order to save cost.
3. ECS Fargate was prefect for testing, I didn't even need to think about terminate the EC2 after testing.
4. Enable Select or All audit on all application tables would significantly impact the application performance, even the hardware resources (CPU and Disk IO) were not fully saturated. The situation would be even worst If the hardware resource was already reach the bottleneck before enabled audit.
