/* ----------------------------- Custom Modules ----------------------------- */
import Repository from '../../base/repository/Repository'
import { IUser } from '../../common/interfaces'
import errorHandler from '../../common/helpers/errors/error.handler'
/* -------------------------------------------------------------------------- */

class AuthRepository extends Repository {
    addUser(args: { email: string; password: string }): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.insertOne<IUser>('users', args)
                .then((result) => {
                    if (result.row_count) return reject(errorHandler(404))
                    else return resolve(result.rows[0])
                })
                .catch((err) => reject(errorHandler(500, err.message)))
        })
    }

    getUser(args: { email: string }): Promise<IUser> {
        return new Promise((resolve, reject) => {
            this.findOne<IUser>('users', args)
                .then((result) => {
                    if (result.row_count) return reject(errorHandler(404))
                    else return resolve(result.rows[0])
                })
                .catch((err) => reject(errorHandler(500, err.message)))
        })
    }
}

export default new AuthRepository()
