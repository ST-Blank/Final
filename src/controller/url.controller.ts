import { Request,Response,Router } from 'express';
import {getConnection} from 'typeorm';
import {Url} from '../entity/Url';
import { UrlRepository } from '../repository/url.repository';
import { UserRepository } from '../repository/user.repository';
import shortId from 'shortid';

export class urlController{
    private router:Router;
    private urlRepository: UrlRepository;
    private userRepository: UserRepository;

    constructor() {
        this.router = Router();
        this.urlRepository = getConnection().getCustomRepository(UrlRepository);
        this.userRepository = getConnection().getCustomRepository(UserRepository);
        this.initializeRoutes();
      }

    // with Custom Repository
    //Create new Url by user
 private async addUrl(req: Request, res: Response) {
  try { 
    const id=req.params.id;
    const user=await this.userRepository.findOneOrFail(id)
    if(user){
      if (!req.body.urlFull) {
        return res.status(406).send({message:'Cannot Be Empty'})
        }   
    const url=new Url();
    url.urlFull=req.body.urlFull;
    //for duplicate url
    const url_present=await this.urlRepository.query("select * from url where urlFull = ? AND userId= ? ORDER BY urlFull",[url.urlFull,user.id]);
    // console.log(url_present)
    // console.log(url_present.length)
    if(url_present.length > 0){
      console.log(url_present)
      return res.status(200).send({message:'url already present'})
    }
    url.urlShort=shortId.generate();
    url.userId=user.id;
    const resultUrl=await this.urlRepository.save(url)    
    return res.redirect('/url');
    }
    } catch (error) {
      return res.status(500).send('Internal Error');
    }
  }

     //Get Url by ID
 private async getUrlwithID(req:Request,res:Response){
  try {
    const id=req.params.id;
    const user=await this.userRepository.findOneOrFail(id);
    if(user){
              const uid=req.params.uid
             const result = await this.urlRepository.findOneOrFail(uid);
      return res.status(200).json(result);
    }
        } catch (error) {
         return res.status(500).send('Internal Error');
   }
   }

//    //Update user by ID
//    private async updateUser(req:Request, res:Response){
//      const id=req.params.id
//      try {
//           const user=await this.urlRepository.findOneOrFail(id);
//      if(user){ 
//          const insertUser:User=req.body;
//      const updatedUSer:User={...user, ...insertUser}
//     const updateUser =await this.urlRepository.save(updatedUSer)
//     return res.status(200).json(updateUser);
//    }
//      }
//      catch (error) {
//          return res.status(500).send('Internal Error');
//      }
//     } 
   //Remove Url by ID
   private async removeUrl(req:Request,res:Response){
    try {
      const id=req.params.id;
      const user=await this.userRepository.findOneOrFail(id);
      if(user){
         const uid=req.params.uid
         const  result=await this.urlRepository.findOneOrFail(uid);
         const removeUrl=await this.urlRepository.remove(result);
         const tokenData=req.cookies
     const token=tokenData.token     
     return res.redirect(`/url/?token=${token}`);
        // return res.status(200).json([{data:removeUrl}]);
    } 
  }catch (error) {
     
  }
   }

   //takes the short url and redirects to full url which given by the users
   public async urlService(req:Request,res:Response){
     try {
       const urlLink= await this.urlRepository.findOneOrFail({urlShort:req.params.urlcode})
      // return res.send(urlLink)
      res.redirect(urlLink.urlFull)
     } catch (error) {
        return res.status(404).send('URL cannot be found');
     }
   }

    public getRouter(): Router {
         return this.router;
        }

      public initializeRoutes() {
        //api for url related with users and it will start from /user
        this.router.post('/:id/url', (req, res) => this.addUrl(req, res));
        this.router.get('/:id/url', (req, res) => this.getUrl(req, res));
        this.router.get('/:id/url/:uid', (req, res) => this.getUrlwithID(req, res));
        // this.router.put('/:id', (req, res) => this.updateUser(req, res));
        this.router.post('/:id/url/:uid', (req, res) => this.removeUrl(req, res));
        this.router.get('/:id/url/:uid/:urlcode',(req, res)=> this.urlService(req, res));
        }     
}
