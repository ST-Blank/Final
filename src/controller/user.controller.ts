import { Request,Response,Router } from 'express';
import {EntityNotFoundError, getConnection} from 'typeorm';
import {User} from '../entity/User';
import { UserRepository } from '../repository/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorMonitor } from 'events';

export class userController{
    private router:Router;
    private userRepository: UserRepository;

    constructor() {
        this.router = Router();
        this.userRepository = getConnection().getCustomRepository(UserRepository);
        this.initializeRoutes();
      }

       //Create new User
 private async addUser(req: Request, res: Response) {
   try {
    if (!req.body.userName || !req.body.password) {
      return res.status(406).send({message:'User Name and Password Cannot be Empty'})
     } 
     const {userName ,password:plainTextPassword}=req.body
   const password =await bcrypt.hash(plainTextPassword,10)
    const user =new User; 
     user.userName=userName;
    user.password=password;
    const result =await this.userRepository.save(user);
    res.redirect('/login');
    //return res.status(200).json(result);
   } catch (error:any) {
     if(error.code==='ER_DUP_ENTRY'){
      return res.status(406).send('user name should be unique');
     }
     else{
   return res.status(500).send('Internal error');
   }
  }
   
  }

  //checks login credentials in login form
  private async loginUser(req: Request, res: Response) {
    try {
      if (!req.body.userName || !req.body.password) {
        return res.status(406).send({message:'User Name and Password Cannot be Empty'})
       }
      const jwtToken=process.env.jwtsecret||'dwadawdwadwadwadwad';
      const {userName,password}=req.body
    const user = await this.userRepository.findOneOrFail({userName});
    if(!user){
     res.status(400).send({message:'cannot be empty'})
    }
    if(await bcrypt.compare(password,user.password)){
      const token=jwt.sign(
          {
              id:user.id,
              userName:user.userName
          },
          jwtToken,
          {
            expiresIn:"1h"
          }
          );
          res.cookie(`token`,`${token}`);
        //  return res.redirect(`/url/?token=${token}`);
        return res.redirect(`/url`);
         // return res.status(200).json({message:'ok',token:token}) 
      // //return res.json({status:'ok',data:token})
     // return  res.send(token) 
  }else{
    res.send({message:'invalid username and password'})
  }
    } catch (error:any) {
      if (EntityNotFoundError) {
        res.send({message:'invalid username and password'})
      }else{
      
      return res.status(500).send('enternal error');
      }
    }
   }

      //Get User 
      private async getUser(req:Request,res:Response){
        try {
          const user = await this.userRepository.find();
   return res.status(200).json(user);
     } catch (error) {
      return res.status(500).send('Internal Error');
     }
      }

     //Get User by ID
 private async getUserByID(req:Request,res:Response){
         try {
              const id=req.params.id
             const user = await this.userRepository.findOneOrFail(id);
      return res.status(200).json(user);
        } catch (error) {
         return res.status(500).send('Internal Error');
        }
   }

//    //Update user by ID
//    private async updateUser(req:Request, res:Response){
//      const id=req.params.id
//      try {
//           const user=await this.userRepository.findOneOrFail(id);
//      if(user){ 
//          const insertUser:User=req.body;
//      const updatedUSer:User={...user, ...insertUser}
//     const updateUser =await this.userRepository.save(updatedUSer)
//     return res.status(200).json(updateUser);
//    }
//      }
//      catch (error) {
//          return res.status(500).send('Internal Error');
//      }
//     } 

   //Remove User by ID
   private async removeUSer(req:Request,res:Response){
       const id=req.params.id
       const user=await this.userRepository.findByIds([id]);
       const removeUser=await this.userRepository.remove(user);
       return res.status(200).json([{message:'user removed is '+id }, {data:removeUser}]);
   }

    public getRouter(): Router {
         return this.router;
        }

      public initializeRoutes() {
        //api for users and starts form /user
        this.router.get('', (req, res) => this.getUser(req, res));
        this.router.post('', (req, res) => this.addUser(req, res));
        this.router.post('/login', (req, res) => this.loginUser(req, res));
        this.router.get('/:id', (req, res) => this.getUserByID(req, res));
       // this.router.put('/:id', (req, res) => this.updateUser(req, res));
        this.router.delete('/:id', (req, res) => this.removeUSer(req, res));
        }
}