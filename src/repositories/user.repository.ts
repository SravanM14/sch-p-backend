import User, { IUser } from '../models/user.model';

class UserRepository {
    /**
     * create user
     */
    async create(userData: Partial<IUser>): Promise<IUser> {
        return await User.create(userData);
    }

    /**
     * find user by email
     */

    async findUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email })
    }

    /**
    * find user by id
    */

    async findUserById(id: string): Promise<IUser | null> {
        return await User.findById({ id })
    }

    /**
   * Get All Users
   */

    async findAll(): Promise<IUser[]> {
        return await User.find()
    }

    /**
  * update user by id
  */

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, data, { new: true })
    }


    /**
  * Delete user by id
  */

    async deleteUser(id: string): Promise<IUser | null> {
        return await User.findByIdAndDelete(id);
    }
}

export default new UserRepository();