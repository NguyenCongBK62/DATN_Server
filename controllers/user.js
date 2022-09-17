const db = require("../databaseConfig");
const bcrypt = require("bcrypt-nodejs");
const JWT = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { JWT_SECRET } = require("../configs");
const { mailerUmat } = require("../helper/helper");
const pool = require("../configs/databaseConnect");

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

const authGoogle = async (req, res) => {
  // res.setHeader('Authorization', token);
  return res.status(200).json({
    userName: req.user.username,
    accessToken: encodedToken(req.user.id),
  });
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
      .query("select * from account where email = $1 and role = 0", [email])
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
      console.log(err);
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

const signUp = async (req, res, next) => {
  const { email, username, password } = req.body;
  try {
    if (!email || !username || !password) {
      const error = new Error("Vui lòng điền đầy đủ thông tin !");
      error.statusCode = 303;
      throw error;
    }
    let foundAccount = await pool
      .query("select * from account where email =  $1", [email])
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    if (foundAccount.length > 0) {
      const error = new Error("Email đã được đăng kí");
      error.statusCode = 303;
      throw error;
    } else {
      let account = await pool
        .query(
          "insert into account(username, email, password) values ($1, $2, $3) returning *",
          [username, email, bcrypt.hashSync(password)],
        )
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
      return res.status(200).json({
        status: "success",
        Authorization: encodedToken(account.id),
        email: account.email,
        username: account.username,
      });
    }
  } catch (error) {
    next(error);
  }
};

const secret = async (req, res) => {
  return res.status(200).json({
    userName: req.user.username,
    accessToken: encodedToken(req.user.id),
  });
};

const listJob = async (req, res) => {
  let jobs = await pool
    .query("select * from job ORDER BY id DESC")
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      console.log(err);
    });

  jobs = await Promise.all(
    jobs.map(async (job) => {
      let jobTechSkill = await pool
        .query(
          "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });
      let jobLanguageSkill = await pool
        .query(
          "select name from languageskill where id in (select languageid from job, joblanguageskill where job.id = joblanguageskill.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });
      let position = await pool
        .query(
          "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });

      job.techSkills = jobTechSkill.map((j) => {
        return j.name;
      });
      job.languageSkills = jobLanguageSkill.map((j) => {
        return j.name;
      });
      job.position = position.map((j) => {
        return j.name;
      });
      return job;
    }),
  );
  return res.status(200).json(jobs);
};

const getProfileCompany = async (req, res, next) => {
  const { id } = req.body;
  let companyProfile = await db
    .select("*")
    .from("companycv")
    .where("id", "=", id);
  return res.status(200).json({
    id: companyProfile[0].id,
    address: companyProfile[0].address,
    description: companyProfile[0].description,
    field: companyProfile[0].field,
    logo: companyProfile[0].logo,
    memberQuantity: companyProfile[0].memberquantity,
    name: companyProfile[0].name,
    slogan: companyProfile[0].slogan,
    timeOT: companyProfile[0].timeot,
    workTimeEnd: companyProfile[0].worktimeend,
    workTimeStart: companyProfile[0].worktimestart,
  });
};

const getListCompany = async (req, res, next) => {
  let listCompany = await db("companycv").select("*");
  return res.status(200).json(listCompany);
};

const applyJob = async (req, res, next) => {
  const { linkcv, candidatefullname, phone, token, jobid } = req.body;
  const candidateid = jwt_decode(token).sub;
  try {
    let candidatecv = await pool
      .query(
        "insert into candidatecv(candidateid, linkcv, candidatefullname, phone) values ($1, $2, $3, $4) returning *",
        [candidateid, linkcv, candidatefullname, phone],
      )
      .then((results) => {
        return results.rows[0];
      })
      .catch(() => {
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    await pool
      .query("insert into apply(candidatecvid, jobid) values ($1, $2)", [
        candidatecv.id,
        jobid,
      ])
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    let candidateEmail = await pool
      .query("select email from account where id = $1", [candidateid])
      .then((results) => {
        return results.rows[0].email;
      })
      .catch(() => {
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    let job = await pool
      .query("select CompanyID,JobTitle  from job where id = $1", [jobid])
      .then((results) => {
        return results.rows[0];
      })
      .catch(() => {
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    const companyEmail = await pool
      .query("select email from account where id = $1", [job.companyid])
      .then((results) => {
        return results.rows[0].email;
      })
      .catch(() => {
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    mailerUmat(
      candidateEmail,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
          Bạn vừa apply vào công việc 
          <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          ${job.jobtitle}
          </span>
          , hãy chờ nhà tuyển dụng xét duyệt CV và liên hệ tới bạn !
        </p>`,
      "Thông báo từ Umat",
    );
    mailerUmat(
      companyEmail,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
        Một ứng viên có tên là 
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          ${candidatefullname}
        </span> 
        vừa apply vào vị trí 
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
         ${job.jobtitle}
        </span> 
        của công ty bạn !
      </p>`,
      "Thông báo từ Umat",
    );

    return res.status(200).json({
      status: "success",
      data: candidatecv,
    });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  const { companyid } = req.params;
  const { contentreview, rate, recomment, titlereview, token } = req.body;
  const candidateid = jwt_decode(token).sub;
  try {
    if (
      !contentreview ||
      (recomment !== 0 && recomment !== 1) ||
      !titlereview ||
      !token
    ) {
      const error = new Error("Vui lòng nhập đầy đủ đánh giá !");
      error.statusCode = 303;
      throw error;
    }
    let review = await pool
      .query(
        "insert into review(CandidateId, titlereview, contentreview, CompanyID, rate, recomment) values ($1, $2, $3, $4, $5, $6) returning *",
        [candidateid, titlereview, contentreview, companyid, rate, recomment],
      )
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
    let companyEmail = await pool
      .query("select email from account where id = $1", [companyid])
      .then((results) => {
        return results.rows[0].email;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    mailerUmat(
      companyEmail,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
          Doanh nghiệp của bạn vừa nhận được đánh giá 
          <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
            ${titlereview}
          </span> 
            với nội dung
          <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
            ${contentreview}
          </span> 
        </p>`,
      "Thông báo từ Umat",
    );
    return res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    return next(err);
  }
};

const getListReview = async (req, res, next) => {
  const { companyid } = req.params;
  try {
    let listReview = await pool
      .query("select * from review where companyid = $1", [companyid])
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Truy vấn dữ liệu không thành công !");
        error.statusCode = 303;
        throw error;
      });
    return res.status(200).json({
      status: "success",
      data: listReview,
    });
  } catch (err) {
    return next(err);
  }
};

const getListJobByCompanyId = async (req, res) => {
  const { companyid } = req.params;
  let jobs = await pool
    .query("select * from job where companyid = $1", [companyid])
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      console.log(err);
    });

  jobs = await Promise.all(
    jobs.map(async (job) => {
      let jobTechSkill = await pool
        .query(
          "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });
      let jobLanguageSkill = await pool
        .query(
          "select name from languageskill where id in (select languageid from job, joblanguageskill where job.id = joblanguageskill.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });
      let position = await pool
        .query(
          "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
          [job.id],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
        });
      job.position = position.map((j) => {
        return j.name;
      });

      job.techSkills = jobTechSkill.map((j) => {
        return j.name;
      });
      job.languageSkills = jobLanguageSkill.map((j) => {
        return j.name;
      });
      return job;
    }),
  );
  return res.status(200).json(jobs);
};

const getJobBySearch = async (req, res, next) => {
  const seacrhText = req.query.searchText;
  try {
    let jobs = await pool
      .query("select * from job where LOWER(JobTitle) like LOWER($1)", [
        "%" + seacrhText + "%",
      ])
      // .query("select * from job where JobTitle like'%PHP%'")
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    jobs = await Promise.all(
      jobs.map(async (job) => {
        let jobTechSkill = await pool
          .query(
            "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let jobLanguageSkill = await pool
          .query(
            "select name from languageskill where id in (select languageid from job, joblanguageskill where job.id = joblanguageskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let position = await pool
          .query(
            "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
          });
        job.position = position.map((j) => {
          return j.name;
        });

        job.techSkills = jobTechSkill.map((j) => {
          return j.name;
        });
        job.languageSkills = jobLanguageSkill.map((j) => {
          return j.name;
        });
        return job;
      }),
    );
    return res.status(200).json(jobs);
  } catch (error) {
    return next(err);
  }
};

const resetPasswordMailer = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      const error = new Error("Mời nhập đầy đủ thông tin!");
      error.statusCode = 303;
      throw error;
    }

    const account = await pool
      .query("select * from account where email = $1 and role = 0", [email])
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        const error = new Error(
          "Truy vấn không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    if (account.length === 0) {
      const error = new Error(
        "Tài khoản không tồn tại trong hệ thống vui lòng kiểm tra lại !",
      );
      error.statusCode = 303;
      throw error;
    }

    await pool
      .query("update account set password = $1 where email = $2 returning *", [
        bcrypt.hashSync("123456a@"),
        email,
      ])
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        const error = new Error(
          "Truy vấn không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    mailerUmat(
      email,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
        Mật khẩu của bạn đã được đổi mới thành 
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          123456a@
        </span> 
        để bảo mật bạn nên đổi mật khẩu sau khi đăng nhập lại
      </p>`,
      "Thông báo từ Umat",
    );
    return res.status(200).json({
      status: "success",
      data: { mess: "Gửi thành công !" },
    });
  } catch (error) {
    next(error);
  }
};

const getTechSkillList = async (req, res, next) => {
  try {
    let listTechSkill = await pool
      .query("select DISTINCT name,count(name) from TechSkill group by name")
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    return res.status(200).json({
      status: "success",
      data: listTechSkill,
    });
  } catch (error) {
    next(error);
  }
};

const getJobByTechSkill = async (req, res, next) => {
  const techskill = req.query.techskill;
  try {
    let jobs = await pool
      .query(
        "select * from job where id in (select DISTINCT jobid from JobTechSkill, TechSkill where TechSkillID = id and name = $1) ",
        [techskill],
      )
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    jobs = await Promise.all(
      jobs.map(async (job) => {
        let jobTechSkill = await pool
          .query(
            "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let jobLanguageSkill = await pool
          .query(
            "select name from languageskill where id in (select languageid from job, joblanguageskill where job.id = joblanguageskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let position = await pool
          .query(
            "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
          });
        job.position = position.map((j) => {
          return j.name;
        });

        job.techSkills = jobTechSkill.map((j) => {
          return j.name;
        });
        job.languageSkills = jobLanguageSkill.map((j) => {
          return j.name;
        });
        return job;
      }),
    );
    return res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getLisCompanySearch = async (req, res, next) => {
  try {
    let listCompany = await pool
      .query("select * from CompanyCV")
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Truy vấn thành công vui lòng kiểm tra lại !");
        error.statusCode = 303;
        throw error;
      });
    listCompany = await Promise.all(
      listCompany.map(async (company) => {
        let rates = await pool
          .query("select rate from review where CompanyID = $1", [company.id])
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });

        let rate =
          rates.length !== 0
            ? rates.reduce((partialSum, r) => partialSum + r.rate, 0) /
              rates.length
            : 0;
        company.rate = rate;
        return company;
      }),
    );

    return res.status(200).json({
      status: "success",
      data: listCompany,
    });
  } catch (error) {
    next(error);
  }
};

const getCityList = async (req, res, next) => {
  try {
    let listCity = await pool
      .query(
        "select DISTINCT Worksplace ,count(ID) from job group by Worksplace",
      )
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    return res.status(200).json({
      status: "success",
      data: listCity,
    });
  } catch (error) {
    next(error);
  }
};

const getJobByCity = async (req, res, next) => {
  const city = req.query.city;
  try {
    let jobs = await pool
      .query("select * from job where Worksplace = $1", [city])
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    jobs = await Promise.all(
      jobs.map(async (job) => {
        let jobTechSkill = await pool
          .query(
            "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let jobLanguageSkill = await pool
          .query(
            "select name from languageskill where id in (select languageid from job, joblanguageskill where job.id = joblanguageskill.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        let position = await pool
          .query(
            "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
            [job.id],
          )
          .then((data) => {
            return data.rows;
          })
          .catch((err) => {
            console.log(err);
          });
        job.position = position.map((j) => {
          return j.name;
        });

        job.techSkills = jobTechSkill.map((j) => {
          return j.name;
        });
        job.languageSkills = jobLanguageSkill.map((j) => {
          return j.name;
        });
        return job;
      }),
    );
    return res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

const changePass = async (req, res, next) => {
  // Assign a token
  const { token, oldpassword, newpassword } = req.body;
  const id = jwt_decode(token).sub;
  try {
    if (!oldpassword || !newpassword) {
      console.log(err);
      const error = new Error("Mời nhập đầy đủ thông tin!");
      error.statusCode = 303;
      throw error;
    }
    let account = await pool
      .query("select * from account where id = $1 and role = 0", [id])
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
      const error = new Error("Phiên đăng nhập hết hạn");
      error.statusCode = 303;
      throw error;
    }
    const isValid = await bcrypt.compareSync(oldpassword, account.password);

    if (!isValid) {
      const error = new Error("mật khẩu cũ không đúng !");
      error.statusCode = 303;
      throw error;
    }

    account = await pool
      .query("update account set password = $1 where id = $2 returning *", [
        bcrypt.hashSync(newpassword),
        id,
      ])
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

    return res.status(200).json({
      status: "success",
      mess: "đổi mật khẩu thành công !",
    });
  } catch (error) {
    next(error);
  }
};

const checkAccount = async (req, res, next) => {
  const { token } = req.body;

  try {
    if (token === null) {
      const error = new Error("Vui lòng đăng nhập !");
      error.statusCode = 303;
      throw error;
    }
    const accountid = jwt_decode(token).sub;
    let account = await pool
      .query("select * from account where id = $1", [accountid])
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Truy vấn dữ liệu không thành công !");
        error.statusCode = 303;
        throw error;
      });
    if (account.length === 0) {
      const error = new Error("Tài khoản hiện không còn trong hệ thống !");
      error.statusCode = 303;
      throw error;
    } else {
      return res.status(200).json({
        status: "success",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signIn,
  signUp,
  secret,
  authGoogle,
  listJob,
  getProfileCompany,
  getListCompany,
  applyJob,
  addReview,
  getListReview,
  getListJobByCompanyId,
  getJobBySearch,
  resetPasswordMailer,
  getTechSkillList,
  getJobByTechSkill,
  getLisCompanySearch,
  getCityList,
  getJobByCity,
  changePass,
  checkAccount,
};
