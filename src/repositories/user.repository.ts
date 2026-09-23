import User, { IUser, UserRole } from '../models/user.model';

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
        return await User.findById(id)
    }


    async findUserByUserId(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId });
}
    /**
   * Get All Users
   */

    async findAll(): Promise<IUser[]> {
        return await User.find()
    }


    async findUsers(search?: string, role?: UserRole, isActive?: boolean,
        page:number =1, limit:number =10
    ): Promise<{
        users:IUser[],
        totalUsers:number
    }>{
      const filter:Record<string, unknown> = {}

      if(search){
        filter.$or=[
            {
                userId:{
                    $regex:search,
                    $options:"i",
                },
            },
            {
                email:{
                    $regex:search,
                    $options:"i",
                }
            },
            {
                name:{
                     $regex:search,
                    $options:"i",
                }
            }
        ]
      }

      if(role){
        filter.role = role;
      }

      if(isActive !== undefined){
        filter.isActive = isActive;
      }

      const skip = (page -1 )* limit;

      const [users, totalUsers] = await Promise.all([
        User.find(filter)
             .skip(skip)
             .limit(limit),

             User.countDocuments(filter)
      ])
      return{
        users, totalUsers
      }
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

    async findUserByResetToken(token: string) {
    return User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
            $gt: new Date()
        }
    });
}

}

export default new UserRepository();