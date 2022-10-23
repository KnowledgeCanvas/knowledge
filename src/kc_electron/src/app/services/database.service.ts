/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import * as http from "http";
import {PrismaClient} from "@prisma/client";

let share: any = (global as any).share;
let url: any = share.url;
let sqlite3: any = share.sqlite3;
const settings = require('./settings.service');
const express = require('express');
const prisma = new PrismaClient();


class DatabaseService {
    private __server?: http.Server;
    private __PORT = 9001;
    private __app = express();


    constructor() {
        console.log('Prisma database: ', prisma);
        this.setup();
    }


    setup() {
        this.__app.get('/sources', async (req: any, res: any) => {
            const source = await prisma.source.findMany();
            res.send(source);
        });

        this.__app.get('/projects', async (req: any, res: any) => {
            const project = await prisma.project.findMany();
            res.send(project);
        });

        this.__app.use(express.json());
        this.__app.put('/source', async (req: any, res: any) => {
            const ks = req.body;

            console.log('Adding source from: ', ks);

            let data: any = {
                id: ks.id.value,
                title: ks.title,
                accessLink: ks.accessLink,
                icon: '',
                type: ks.ingestType,
                thumbnail: '',
                flagged: ks.flagged,
                createdAt: ks.dateCreated
            }

            // TODO: add events

            if (ks.dateUpdated && ks.dateUpdated.length > 0) {
                data = {...data, updatedAt: ks.dateUpdated[ks.dateUpdated.length - 1]}
            }

            if (ks.associatedProject && ks.associatedProject.value) {
                data = {...data, projectId: ks.associatedProject.value};
            }

            const source = await prisma.source.create({
                data: data
            }).then((result) => {
                console.log('Result from creating source: ', result);
                res.send(result);
            }).catch((error: any) => {
                console.log('Error creating source: ', error);
                res.send(error);
            })
        });

        this.__app.put('/project', async (req: any, res: any) => {
            const project = req.body;
            console.log('Adding project with request: ', project);

            let data: any = {
                id: project.id,
                name: project.name,
                description: project.description
            }

            prisma.project.create({
                data: data
            }).then(() => {
                res.send(project);
            }).catch(() => {
                res.send();
            })
        })

        this.__app.listen(this.__PORT, () => {
            console.log(`Example app listening on port ${this.__PORT}`)
        })
    }
}

const databaseService = new DatabaseService();
module.exports = {
    database: databaseService
}
