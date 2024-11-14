// Uganda Coffee Innovation Portal (UCIP)
// Next.js application for comprehensive coffee management in Uganda

// pages/_app.js
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import '../styles/globals.css'

// Theme configuration based on Uganda flag colors
const theme = extendTheme({
  colors: {
    brand: {
      green: '#078930',
      red: '#D90000',
      black: '#000000',
      yellow: '#FCD116',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'black',
      },
    },
  },
})

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  )
}

export default MyApp

// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prisma'
import { comparePassword } from '../../../lib/auth'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add authentication logic
      }
    })
  ],
  session: {
    strategy: 'jwt'
  }
})

// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          String
  farms         Farm[]
  listings      Listing[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Farm {
  id            String    @id @default(cuid())
  name          String
  location      String
  size          Float
  coffeeType    String
  certification String?
  owner         User      @relation(fields: [ownerId], references: [id])
  ownerId       String
  inventory     Inventory[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Inventory {
  id            String    @id @default(cuid())
  farm          Farm      @relation(fields: [farmId], references: [id])
  farmId        String
  quantity      Float
  qualityGrade  String
  harvestDate   DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Listing {
  id            String    @id @default(cuid())
  seller        User      @relation(fields: [sellerId], references: [id])
  sellerId      String
  productType   String
  quantity      Float
  price         Float
  description   String
  status        String
  transactions  Transaction[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Transaction {
  id            String    @id @default(cuid())
  listing       Listing   @relation(fields: [listingId], references: [id])
  listingId     String
  amount        Float
  status        String
  logistics     Logistics?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Message {
  id            String    @id @default(cuid())
  content       String
  sender        User      @relation("SentMessages", fields: [senderId], references: [id])
  senderId      String
  receiver      User      @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId    String
  read          Boolean   @default(false)
  createdAt     DateTime  @default(now())
}

model Logistics {
  id              String    @id @default(cuid())
  transaction     Transaction @relation(fields: [transactionId], references: [id])
  transactionId   String    @unique
  status          String
  carrier         String
  trackingNumber  String
  estimatedDelivery DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// components/Layout.js
import { Box, Flex } from '@chakra-ui/react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <Box minH="100vh">
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={4}>
          {children}
        </Box>
      </Flex>
    </Box>
  )
}

// pages/index.js
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import Layout from '../components/Layout'
import DashboardCard from '../components/DashboardCard'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <Layout>
      <Box>
        <Heading mb={6}>Dashboard</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <DashboardCard title="Total Farms" value="156" />
          <DashboardCard title="Active Listings" value="43" />
          <DashboardCard title="Pending Shipments" value="12" />
          <DashboardCard title="Monthly Revenue" value="$45,678" />
        </SimpleGrid>
      </Box>
    </Layout>
  )
}

// pages/marketplace.js
import { useState } from 'react'
import {
  Box,
  Heading,
  Grid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import Layout from '../components/Layout'
import ListingCard from '../components/ListingCard'
import CreateListingForm from '../components/CreateListingForm'

export default function Marketplace() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Layout>
      <Box>
        <Heading mb={6}>Marketplace</Heading>
        <Button colorScheme="green" onClick={onOpen} mb={6}>
          Create New Listing
        </Button>
        
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {/* Listing cards will be mapped here */}
        </Grid>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Listing</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CreateListingForm onClose={onClose} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  )
}

// Add other necessary pages and components for:
// - Farm Management (/pages/farms)
// - Logistics (/pages/logistics)
// - Financial Management (/pages/finance)
// - Messaging System (/pages/messages)
// - Reports and Analytics (/pages/reports)

