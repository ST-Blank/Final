import axios from 'axios';
import { Request, Response, Router } from 'express';
import jwt_decode from "jwt-decode";
import { User } from '../entity/User';
import { Url } from '../entity/Url';


export class ejsController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  //main page /login
  private async login(req: Request, res: Response) {
    res.render('login')
  }

  // signup or registration page
  private async signup(req: Request, res: Response) {
    res.render('signup')
  }

  //page rendered for particular user where URL service is granted
  private async mainPage(req: Request, res: Response) {
     try {
  //  const token=`${req.query.token}`;
  const tokenData=req.cookies
 const token=tokenData.token 
   const userData:User = jwt_decode(token);
  const id=userData.id
  res.cookie(`token`,`${token}`);
  const urlData= await axios.get(`http://localhost:${process.env.PORT}/user/${id}/url`)
  const url:Url=urlData.data
 // console.log(url);
  res.render('url',{user:userData,url:url})
     } catch (error:any) {
       if(error.message==='Invalid token specified'){
         res.redirect('/login');

       }else{ 
       console.log(error.message);
       }
     }
  }

//logout user
private async logoutUser(req:Request,res:Response){
  try {
    // const tokenData=req.cookies
    //  const token=tokenData.token
    // console.log(req.cookies);
   await res.clearCookie("token");
  // console.log(req.cookies);
  res.render('login');
  } catch (error) {
    res.send('enternal problem')
  }
 }

  public getRouter(): Router {
    return this.router;
  }

  public initializeRoutes() {
    //api for rendering ejs files inside views
    this.router.get('/login', (req, res) => this.login(req, res));
    this.router.get('/signup', (req, res) => this.signup(req, res));
    this.router.get('/url', (req, res) => this.mainPage(req, res));
    this.router.get('/logout', (req, res) => this.logoutUser(req, res));
  }
}