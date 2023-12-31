import clientPromise from "@/lib/mongodb";
import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google";

async function isAdminEmail(email) {
    mongooseConnect();
    return !!(await Admin.findOne({ email }));
}

export const authOptions = {
    secret: process.env.SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        session: async ({ session, token, user }) => {
            if (await isAdminEmail(session?.user?.email)) {
                return session;
            } else {
                return false;
            }
        },
        async destroySession({ session }) {
            // Clear the __Secure-next-auth.session-token cookie
            return {
                ...session,
                accessToken: null,
                accessTokenExpires: 0,
                refreshToken: null,
                refreshTokenExpires: 0,
            };
        },
    },
}

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!(await isAdminEmail(session?.user?.email))) {
        res.status(401);
        res.end();
        throw 'not an admin';
    }
}