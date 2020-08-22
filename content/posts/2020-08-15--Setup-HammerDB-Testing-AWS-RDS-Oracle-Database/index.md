---
title: Setup a HammerDB Testing AWS RDS Oracle Database
subTitle: AWS Oracle RDS
category: "AWS"
cover: RDS.png
---

Move the HammerDB testing database to AWS from the local Virtual Box Oracle development image. It could provide a better testing platform as it can scale up without limit if you willing to pay. (Yes, it has limit, but it is much much higher than what I need.) 

## Create RDS Database for Testing

__NOTE: We will create AWS resources that incur costs. It is chargeable, please be aware.__



Create a AWS RDS Oracle database after login AWS console: 

![](./6_rds_create_database.jpg)
![](./7_rds_create_database.jpg)

Standard Edition 2 (licence included) should be good enough for this testing.
Select Dev/Test database template:
![](./8_rds_create_database.jpg)

Pick the CPU type that you like, it can be changed afterward:
![](./9_rds_create_database.jpg)

20GB should be large enough.

P.S. 25GB is not enough for build in SELECT Audit test. Need to increase to 50GB at the end.
![](./10_rds_create_database.jpg)
![](./11_rds_create_database.jpg)
![](./12_rds_create_database.jpg)

No backup and Encryption is needed for this testing database:
![](./13_rds_create_database.jpg)

Enable Performance insights and enhanced monitoring to collect performance information:
![](./14_rds_create_database.jpg)
![](./15_rds_create_database.jpg)
![](./16_rds_create_database.jpg)
![](./17_rds_create_database.jpg)
![](./18_rds_create_database.jpg)
![](./19_rds_create_database.jpg)



## Export TPCC schema from the existing HammerDB database

I have an existing HammerDB testing database in my VirtualBox Oracle development VM. It contains a TPCC schema and 60 warehouses. To save time to build the TPCC schema and warehouses in AWS RDS. I decide to export the schema using Oracle datadump export (expdp) and upload the dump to S3. I will import the data to AWS RDS later using datadump import (impdp)

In the VirtualBox Oracle development VM, execute following commands in sqlplus to create a directory and expdp:

```
CREATE DIRECTORY DATA_PUMP_DIR_1 AS '/u01/datapump';
```

![](./1_export_tpcc.jpg)

```
DECLARE
hdnl NUMBER;
BEGIN
hdnl := DBMS_DATAPUMP.OPEN( operation => 'EXPORT', job_mode => 'SCHEMA', job_name=>null);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'tpcc.dmp', directory => 'DATA_PUMP_DIR_1', filetype => dbms_datapump.ku$_file_type_dump_file);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'tpcc_exp.log', directory => 'DATA_PUMP_DIR_1', filetype => dbms_datapump.ku$_file_type_log_file);
DBMS_DATAPUMP.METADATA_FILTER(hdnl,'SCHEMA_EXPR',' IN (''TPCC'')');
DBMS_DATAPUMP.START_JOB(hdnl);
END;
/  
```

![](./2_export_tpcc.jpg)
![](./3_export_tpcc.jpg)

Create a S3 bucket and upload the expdp dump.
![](./4_upload_dump_to_s3.jpg)
![](./5_upload_dump_to_s3.jpg)


## Set up S3 integration in the RDS

Create an IAM policy to allow Amazon RDS access to an Amazon S3 bucket:
![](./50_s3_intergration.jpg)
![](./51_s3_intergration.jpg)
![](./52_s3_intergration.jpg)

Create an IAM role to allow Amazon RDS access to an Amazon S3 bucket:
![](./53_s3_intergration.jpg)
![](./54_s3_intergration.jpg)
![](./55_s3_intergration.jpg)
![](./56_s3_intergration.jpg)

In the RDS console, associate your IAM role with your DB instance:
![](./57_s3_intergration.jpg)

Configure an option group for Amazon S3 integration:
![](./58_s3_intergration.jpg)
![](./59_s3_intergration.jpg)
![](./60_s3_intergration.jpg)

Need to restart the database to apply the option group.
![](./61_s3_intergration.jpg)

Download the expdb dump Files from the Amazon S3 Bucket to the Oracle DB Instance:
Connect to the RDS via SQLDeveloper, run following SQL:

```
SELECT rdsadmin.rdsadmin_s3_tasks.download_from_s3(
      p_bucket_name    =>  'hammerdb-expdp',       
      p_directory_name =>  'DATA_PUMP_DIR') 
   AS TASK_ID FROM DUAL;  
```
![](./62_s3_intergration.jpg)


To read the log file, run following SQL:
```
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('BDUMP','dbtask-1597064157117-203.log'));                
            
```
![](./63_s3_intergration.jpg)


After the expdp dump uploaded to database, run following SQL to create the TPCCTAB tablespace:
```
CREATE TABLESPACE TPCCTAB;
```
Run the impdb to import the TPCC schema:

```
DECLARE
hdnl NUMBER;
BEGIN
hdnl := DBMS_DATAPUMP.OPEN( operation => 'IMPORT', job_mode => 'SCHEMA', job_name=>null);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'tpcc.dmp', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_dump_file);
DBMS_DATAPUMP.ADD_FILE( handle => hdnl, filename => 'tpcc_imp.log', directory => 'DATA_PUMP_DIR', filetype => dbms_datapump.ku$_file_type_log_file);
DBMS_DATAPUMP.METADATA_FILTER(hdnl,'SCHEMA_EXPR','IN (''TPCC'')');
DBMS_DATAPUMP.START_JOB(hdnl);
END;
/  
```

![](./64_s3_intergration.jpg)

Read the impdp status and read the impdp dump logfile:

```
SELECT * from DBA_DATAPUMP_JOBS;
SELECT text FROM table(rdsadmin.rds_file_util.read_text_file('DATA_PUMP_DIR','tpcc_imp.log'));                           
```
![](./65_s3_intergration.jpg)
![](./66_s3_intergration.jpg)


The TPCC schema is loaded to the Oracle RDS database and we could use it for HammerDB TPCC test.

__Remember to terminate the instance when the testing is complete, if the instance is running, AWS will continue to charge you. You could stop the instance, but there will be a certain amount of charges for the storage for the database.__