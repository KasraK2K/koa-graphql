/* ------------------------------ Dependencies ------------------------------ */
import { GraphQLResolveInfo } from 'graphql'
import _ from 'lodash'
import config from 'config'
/* ----------------------------- Custom Modules ----------------------------- */
import authService from './auth.service'
import { IContext } from '../../graphql/context'
import { IApplicationConfig } from '../../../build/config/config.interface.d'
import { IUserAuthResponse, IAdminAuthResponse, ITokenPayload } from '../../common/interfaces'
import tokenHelper from '../../common/helpers/token.helper'
import errorHandler from '../../common/helpers/errors/error.handler'
/* -------------------------------------------------------------------------- */

const applicationConfig: IApplicationConfig = config.get('application')

const resolvers = {
    Query: {
        loginAdmin: async (
            _parent: IAdminAuthResponse,
            args: { email: string; password: string },
            _context: IContext,
            _info: GraphQLResolveInfo
        ): Promise<IAdminAuthResponse> => {
            const { token, admin } = await authService.loginAdmin(args)
            return { token, admin }
        },

        loginUser: async (
            _parent: IUserAuthResponse,
            args: { email: string; password: string },
            _context: IContext,
            _info: GraphQLResolveInfo
        ): Promise<IUserAuthResponse> => {
            const { token, user } = await authService.loginUser(args)
            return { token, user }
        }
    },

    Mutation: {
        registerAdmin: async (
            _parent: IAdminAuthResponse,
            args: { email: string; password: string },
            context: IContext,
            _info: GraphQLResolveInfo
        ): Promise<IAdminAuthResponse> => {
            const { data } = getTokenAndPayload(context)
            const { token, admin } = await authService.registerAdmin(data, args)
            return { token, admin }
        },

        registerUser: async (
            _parent: IUserAuthResponse,
            args: { email: string; password: string },
            _context: IContext,
            _info: GraphQLResolveInfo
        ): Promise<IUserAuthResponse> => {
            const { token, user } = await authService.registerUser(args)
            return { token, user }
        }
    }
}

const getTokenAndPayload = (context: IContext): { token: string; data: ITokenPayload } => {
    const authorization = context.request.headers.get(applicationConfig.bearerHeader)
    if (authorization) {
        const token = authorization.slice(applicationConfig.bearer.length + 1)
        const { valid, data } = tokenHelper.verify(token)
        if (!valid) throw errorHandler(403)
        else return { token, data }
    } else throw errorHandler(401)
}

export default resolvers
