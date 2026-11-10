import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:[Google],session:{strategy:'jwt'},pages:{signIn:'/login',error:'/login'},
 callbacks:{jwt({token,account}){if(account?.provider==='google')token.googleId=account.providerAccountId;return token;},session({session,token}){if(session.user&&typeof token.googleId==='string')session.user.id=token.googleId;return session;}}
});
