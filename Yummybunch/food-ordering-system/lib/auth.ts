import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if user is a restaurant
        const restaurant = await prisma.restaurant.findUnique({
          where: { email: credentials.email }
        });

        if (restaurant) {
          const isPasswordValid = await compare(credentials.password, restaurant.password);
          if (isPasswordValid) {
            return {
              id: restaurant.id.toString(),
              email: restaurant.email,
              name: restaurant.name,
              role: 'restaurant'
            };
          }
        }

        // Check if user is a customer
        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email }
        });

        if (customer) {
          const isPasswordValid = await compare(credentials.password, customer.password);
          if (isPasswordValid) {
            return {
              id: customer.id.toString(),
              email: customer.email,
              name: customer.name,
              role: 'customer'
            };
          }
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 