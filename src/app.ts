import bodyParser from 'body-parser';
import express, { Express } from 'express';
import { createConnection} from 'typeorm';
import 'reflect-metadata';
import { User } from './entity/User';
import {userController} from './controller/user.controller'
import {Url} from './entity/Url';
import {urlController} from './controller/url.controller'
require ('ejs')
import { ejsController } from './controller/ejs.controller';
require('dotenv').config();
import cookieParser from 'cookie-parser'

const PORT = process.env.PORT || 5000;
const {databaseHost,databaseUsername,databasePassword,databaseDatabase}=process.env;

class Server {
  private app: Express;
 usercontroller!: userController;
 urlcontroller!: urlController;
 ejscontroller!: ejsController;

  constructor() {
    this.app = express();
    this.setupConfig();
    this.setupRoutes();
  }

  public setupConfig(): void {
    this.app.use(express.static('./views'));
    this.app.use(express.static('public'));
    this.app.set("view engine","ejs");
    this.app.use(bodyParser.urlencoded({extended:false}));
    this.app.use(cookieParser());
    
  }

  public async setupRoutes(): Promise<void> {
    await createConnection({
        name:"default",
         type: "mysql",
         host: databaseHost,
         port: 3306,
         username:databaseUsername,
         password: databasePassword,
         database: databaseDatabase,
         synchronize: true,
         logging: false,
         entities: [User,Url]
    });


     this.usercontroller = new userController();
     this.urlcontroller = new urlController();
     this.ejscontroller = new ejsController();

    this.app.use('/user',this.usercontroller.getRouter());
    this.app.use('/user',this.urlcontroller.getRouter());
    this.app.use('/',this.ejscontroller.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log('Listening on port:', PORT);
    });
  }
}

const server = new Server();

// Start server
server.start();
