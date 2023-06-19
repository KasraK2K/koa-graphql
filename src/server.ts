/* ------------------------------ Dependencies ------------------------------ */
import Koa from 'koa'
import chalk from 'chalk'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { Logger } from '@apollo/utils.logger'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'

/* --------------------------------- Modules -------------------------------- */
import resolvers from './graphql/resolvers'
import typeDefs from './graphql/typeDefs'
// import errorMiddleware from './middlewares/errorMiddleware'
import { context } from './graphql/context'
import { GraphQLError } from 'graphql/error/GraphQLError'

/* -------------------------------- Constants ------------------------------- */
const app = new Koa()

const PORT = Number(process.env.PORT) || 3000
let logger: Logger
const gqlStyle = chalk.hex('#f6009b')
const errStyle = chalk.hex('#FF0000').bold
const warnStyle = chalk.hex('#FFFF00').bold
const successStyle = chalk.hex('#00FF00')

// app.use(async (ctx, next) => {
//   try {
//     await errorMiddleware(ctx, next)
//   } catch (error) {
//     // If `errorMiddleware` has error
//     if (error instanceof Error) {
//       ctx.body = {
//         success: false,
//         status: 500,
//         message: error.message,
//       }
//       // TODO : Change this logger.error to winston log
//       logger.error({ message: error.message, statusCode: 500, type: 'ServerError' })
//     } else {
//       ctx.body = {
//         success: false,
//         status: 500,
//         message: 'An unknown error occurred at errorMiddleware',
//       }
//       // TODO : Change this logger.error to winston log
//       logger.error({
//         message: 'An unknown error occurred at errorMiddleware',
//         statusCode: 500,
//         type: 'ServerError',
//       })
//     }
//   }
// })

app.on('error', (err: Error | GraphQLError): void => {
  // TODO : Change this logger.error to winston log
  logger.error('🔴 Error event raised')
  logger.warn(err.stack)
})

/* -------------------------------------------------------------------------- */
/*                            Create Apollo Server                            */
/* -------------------------------------------------------------------------- */
const createApolloServer = (): ApolloServer => {
  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginCacheControl({
        // Cache everything for 1 second by default.
        defaultMaxAge: 1,
        // Don't send the `cache-control` response header.
        calculateHttpHeaders: false,
      }),
    ],
  })
  logger = server.logger
  return server
}

/* -------------------------------------------------------------------------- */
/*                             Run Server Function                            */
/* -------------------------------------------------------------------------- */
// Function to run the server
const run = (port: number) => {
  const server = createApolloServer() // Create the Apollo Server instance

  startStandaloneServer(server, {
    context: async () => context,
    listen: { port },
  })
    .then(({ url }) => {
      logger.info(`${gqlStyle('GraphQL')} server ready at: ${gqlStyle.underline(url)}`)
    })
    .catch((err) => {
      if (err instanceof Error) {
        logger.error(errStyle(`🔴 ${err.message}`))
      } else {
        logger.error(`🔴 An unknown error occurred`)
        console.assert(err)
      }
    })
}

run(PORT) // Run the server with the specified port
