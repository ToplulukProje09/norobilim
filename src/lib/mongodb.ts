import { MongoClient, Db, Collection } from "mongodb";

/* -------------------------------------------------------------------------- */
/* Global type declaration (hot-reload için)                                  */
/* -------------------------------------------------------------------------- */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/* -------------------------------------------------------------------------- */
/* Client & Connection                                                        */
/* -------------------------------------------------------------------------- */
const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("❌ Please add your Mongo URI to .env as MONGODB_URI");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise!;

/* -------------------------------------------------------------------------- */
/* Tip Tanımları                                                              */
/* -------------------------------------------------------------------------- */
export interface MainMenu {
  _id: string; // hep "singleton"
  titlePrimary: string;
  titleSecondary: string;
  mainLogo: string;
  mainPhoto?: string | null;
  aboutParagraph?: string;
  mainParagraph?: string;
  socialLinks: string[];
  email?: string;
}

/* -------------------------------------------------------------------------- */
/* DB & Koleksiyon Erişimi                                                    */
/* -------------------------------------------------------------------------- */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "norobilimadu");
}

export async function getMainMenuCollection(): Promise<Collection<MainMenu>> {
  const db = await getDb();
  return db.collection<MainMenu>("MainMenu");
}

/* -------------------------------------------------------------------------- */
/* Default Export (ÖNEMLİ)                                                    */
/* -------------------------------------------------------------------------- */
export default clientPromise;
