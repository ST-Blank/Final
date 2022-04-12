import {EntityRepository,Repository} from 'typeorm';
import { Url } from "../entity/Url";

@EntityRepository(Url)
export class UrlRepository extends Repository<Url>{}