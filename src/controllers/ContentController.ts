import {Request,Response} from 'express';
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();