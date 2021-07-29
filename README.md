# Challenge-Data

## Components
- [ ] API developed using NodeJS and Express.js
- [ ] Data ingestion with a Python script in a CentOS image
- [ ] Data was stored in a Postgres database
- [ ] API, data ingestion and database deployed in Docker containers


## Containers, tools and programming languages used 
- [ ] Python 3.9.2
- [ ] NodeJS 19.2.0
- [ ] Express.js 4.17.1
- [ ] CentOS container (latest image)
- [ ] Postgres container (latest image)
- [ ] Docker
- [ ] Docker Compose

## Usage

1) Start containers
```
local-machine$ docker-compose build
local-machine$ docker-compose up
```
2) Run CentOS container 
```
local-machine$ docker run --network challenge_centos-postgres -it centos /bin/bash
```
3) Copy data-ingestion folder to CentOS container, to get container id: ``` local-machine$ docker ps ```
```
local-machine$ docker cp data-ingestion <centos-container-id>:/home
```
4) Run install_python.sh
```
centos-container# cd /home/data-ingestion
centos-container# ./install_python.sh
```
5) Run init.py
```
centos-container# python3 init.py
```
6) Access to api is http://localhost:3000
