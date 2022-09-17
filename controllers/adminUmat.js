const bcrypt = require("bcrypt-nodejs");
const JWT = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { JWT_SECRET } = require("../configs");
const pool = require("../configs/databaseConnect");
const helper = require("../helper/helper");
const encodedToken = (id) => {
  return JWT.sign(
    {
      iss: "Nguyen Cong",
      sub: id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 10),
    },
    JWT_SECRET,
  );
};

const signIn = async (req, res, next) => {
  // Assign a token
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      const error = new Error("Mời nhập đầy đủ thông tin!");
      error.statusCode = 303;
      throw error;
    }
    let account = await pool
      .query("select * from account where email = $1 and role = 2", [email])
      .then((results) => {
        return results.rows[0];
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    if (!account) {
      const error = new Error("Đăng nhập không thành công !");
      error.statusCode = 303;
      throw error;
    }
    const isValid = await bcrypt.compareSync(password, account.password);
    if (!isValid) {
      const error = new Error("Sai mật khẩu !");
      error.statusCode = 303;
      throw error;
    }
    return res.status(200).json({
      status: "success",
      Authorization: encodedToken(account.id),
      email: account.email,
      username: account.username,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyAccountList = async (req, res, next) => {
  try {
    let companyAccount = await pool
      .query("select * from account where role = 1")
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    if (companyAccount.length > 0) {
      companyAccount = await Promise.all(
        companyAccount.map(async (a) => {
          let comapnycv = await pool
            .query("select * from CompanyCV where id = $1", [a.id])
            .then((results) => {
              return results.rows[0];
            })
            .catch((err) => {
              console.log(err);
              const error = new Error(
                "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
              );
              error.statusCode = 303;
              throw error;
            });
          a.name = comapnycv.name;
          a.Address = comapnycv.Address;
          a.field = comapnycv.field;
          a.description = comapnycv.description;
          a.memberquantity = comapnycv.memberquantity;
          a.worktimestart = comapnycv.worktimestart;
          a.worktimeend = comapnycv.worktimeend;
          a.slogan = comapnycv.slogan;
          a.logo = comapnycv.logo;
          a.timeot = comapnycv.timeot;
          return a;
        }),
      );
    }
    return res.status(200).json({ status: "success", data: companyAccount });
  } catch (error) {
    return next(error);
  }
};

const createEditCompanyAccount = async (req, res, next) => {
  const {
    username,
    email,
    name,
    address,
    field,
    description,
    memberquantity,
    worktimestart,
    worktimeend,
    slogan,
    logo,
    timeot,
  } = req.body;
  const { companyid } = req.params;
  const hash = bcrypt.hashSync("123456a@");
  try {
    if (companyid === undefined) {
      let result = {};
      let companyAccount = await pool
        .query(
          "insert into account(UserName, Email, Password, Role) values ($1, $2, $3, $4) returning *",
          [username, email, hash, 1],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Thêm mới dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
      let companycv = await pool
        .query(
          "insert into CompanyCV(ID, Name, Address, field, description, memberQuantity, workTimeStart, workTimeEnd, slogan, logo, timeOT) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *",
          [
            companyAccount.id,
            name,
            address,
            field,
            description,
            memberquantity,
            worktimestart,
            worktimeend,
            slogan,
            logo,
            timeot,
          ],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Thêm mới dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });

      result.id = companyAccount.id;
      result.username = companyAccount.username;
      result.email = companyAccount.email;
      result.name = companycv.name;
      result.address = companycv.address;
      result.field = companycv.field;
      result.description = companycv.description;
      result.memberquantity = companycv.memberquantity;
      result.worktimestart = companycv.worktimestart;
      result.worktimeend = companycv.worktimeend;
      result.slogan = companycv.slogan;
      result.logo = companycv.logo;
      result.timeot = companycv.timeot;
      return res.status(200).json({ status: "success", data: result });
    } else {
      let result = {};
      let companyAccount = await pool
        .query(
          " update account set UserName = $1, Email = $2 where id = $3 returning *",
          [username, email, companyid],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Chỉnh sửa dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
      let companycv = await pool
        .query(
          "update CompanyCV set Name = $1, Address = $2, field = $3, description = $4, memberQuantity = $5, workTimeStart = $6, workTimeEnd = $7, slogan = $8, logo = $9, timeOT = $10 where id = $11 returning *",
          [
            name,
            address,
            field,
            description,
            memberquantity,
            worktimestart,
            worktimeend,
            slogan,
            logo,
            timeot,
            companyAccount.id,
          ],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Thêm mới dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
      result.id = companyAccount.id;
      result.username = companyAccount.username;
      result.email = companyAccount.email;
      result.name = companycv.name;
      result.address = companycv.address;
      result.field = companycv.field;
      result.description = companycv.description;
      result.memberquantity = companycv.memberquantity;
      result.worktimestart = companycv.worktimestart;
      result.worktimeend = companycv.worktimeend;
      result.slogan = companycv.slogan;
      result.logo = companycv.logo;
      result.timeot = companycv.timeot;
      return res.status(200).json({ status: "success", data: result });
    }
  } catch (error) {
    return next(error);
  }
};

const getCompanyAccount = async (req, res, next) => {
  const { companyid } = req.params;
  try {
    let result = {};
    let companyAccount = await pool
      .query("select * from account where role = 1 and id = $1", [companyid])
      .then((results) => {
        return results.rows[0];
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    let comapnycv = await pool
      .query("select * from CompanyCV where id = $1", [companyAccount.id])
      .then((results) => {
        return results.rows[0];
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    result.id = companyAccount.id;
    result.username = companyAccount.username;
    result.email = companyAccount.email;
    result.name = comapnycv.name;
    result.address = comapnycv.address;
    result.field = comapnycv.field;
    result.description = comapnycv.description;
    result.memberquantity = comapnycv.memberquantity;
    result.worktimestart = comapnycv.worktimestart;
    result.worktimeend = comapnycv.worktimeend;
    result.slogan = comapnycv.slogan;
    result.logo = comapnycv.logo;
    result.timeot = comapnycv.timeot;
    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return next(error);
  }
};

const getCandidateAccountList = async (req, res, next) => {
  try {
    let candidateAccount = await pool
      .query("select * from account where role = 0")
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    return res.status(200).json({ status: "success", data: candidateAccount });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  const id = req.params.id;
  try {
    const role = await pool
      .query("delete from account where id = $1 returning role, email", [id])
      .then((results) => {
        return results.rows[0];
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Không xóa được dữ liệu trong bảng apply");
        error.statusCode = 303;
        throw error;
      });
    helper.mailerUmat(
      role.email,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
        Tài khoản của bạn đã bị vô hiệu hóa ví một lí do nào đó, vui lòng liên hệ với Umat để biết thêm chi tiết !
      </p>`,
      "Thông báo từ Umat",
    );
    if (role.role === 1) {
      return getCompanyAccountList(req, res, next);
    } else if (role.role === 0) {
      return getCandidateAccountList(req, res, next);
    }
  } catch (error) {
    return next(error);
  }
};

const createEditCandidateAccount = async (req, res, next) => {
  const { username, email } = req.body;
  const { accountid } = req.params;
  const hash = bcrypt.hashSync("123456a@");
  try {
    if (accountid === undefined) {
      let candidateAccount = await pool
        .query(
          "insert into account(UserName, Email, Password) values ($1, $2, $3) returning *",
          [username, email, hash],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          const error = new Error(
            "Thêm mới dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
      return res
        .status(200)
        .json({ status: "success", data: candidateAccount });
    } else {
      let candidateAccount = await pool
        .query(
          " update account set UserName = $1, Email = $2 where id = $3 returning *",
          [username, email, accountid],
        )
        .then((results) => {
          return results.rows[0];
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Chỉnh sửa dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
      return res
        .status(200)
        .json({ status: "success", data: candidateAccount });
    }
  } catch (error) {
    return next(error);
  }
};

const getCandidateAccount = async (req, res, next) => {
  const { accountid } = req.params;
  try {
    let companyAccount = await pool
      .query("select * from account where role = 0 and id = $1", [accountid])
      .then((results) => {
        return results.rows[0];
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Truy xuất dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    return res.status(200).json({ status: "success", data: companyAccount });
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  getCompanyAccountList,
  createEditCompanyAccount,
  getCompanyAccount,
  deleteAccount,
  getCandidateAccountList,
  createEditCandidateAccount,
  getCandidateAccount,
  signIn,
};
