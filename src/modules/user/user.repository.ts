/* ----------------------------- Custom Modules ----------------------------- */
import Repository from '../../base/repository/Repository'
import { IUser, IUserLoginArgs } from '../../common/interfaces/user.interface'
import errorHandler from '../../common/helpers/errors/error.handler'
/* -------------------------------------------------------------------------- */

class UserRepository extends Repository {
    getUser(args: IUserLoginArgs): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.findOne<IUser>('users', args)
                .then((result) => {
                    if (!result.row_count) return reject(errorHandler(400, 'User does not exist.'))
                    else return resolve(result.rows[0])
                })
                .catch((err) => reject(errorHandler(500, err.message)))
        })
    }

    addUser(args: { email: string; password: string }): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.insertOne<IUser>('users', args)
                .then((result) => {
                    if (!result.row_count) return reject(errorHandler(500))
                    else return resolve(result.rows[0])
                })
                .catch((err) => reject(errorHandler(500, err.message)))
        })
    }
}

export default new UserRepository()
