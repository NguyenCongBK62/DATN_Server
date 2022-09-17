const db = require("../databaseConfig");
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

const postJob = async (req, res) => {
  const {
    jobtitle,
    salary,
    worksplace,
    jobdesrciption,
    amount,
    languageskill,
    techskill,
    worktime,
    position,
    token,
  } = req.body;
  const id = jwt_decode(token).sub;
  if (req.body.id) {
    await pool
      .query(
        "update job set jobtitle = $1, salary = $2, worksplace = $3, jobdesrciption = $4, amount = $5, worktime = $6 where id = $7",
        [
          jobtitle,
          salary,
          worksplace,
          jobdesrciption,
          amount,
          worktime,
          req.body.id,
        ],
      )
      .then((results) => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });

    let oldTechSkillId = (
      await pool
        .query(
          "delete from jobtechskill where jobid = $1 returning techskillid",
          [req.body.id],
        )
        .then((results) => {
          return results.rows;
        })
        .catch((err) => {
          console.log(err);
        })
    ).map((i) => {
      return i.techskillid;
    });

    await pool
      .query(
        `delete from techskill where id in (${helper.getParamsQuerry(
          oldTechSkillId,
        )})`,
        oldTechSkillId,
      )
      .then((results) => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });

    let oldLanguageSkillId = (
      await pool
        .query(
          "delete from joblanguageskill where jobid = $1 returning LanguageID",
          [req.body.id],
        )
        .then((results) => {
          return results.rows;
        })
        .catch((err) => {
          console.log(err);
        })
    ).map((i) => {
      return i.languageid;
    });

    await pool
      .query(
        `delete from languageskill where id in (${helper.getParamsQuerry(
          oldLanguageSkillId,
        )})`,
        oldLanguageSkillId,
      )
      .then((results) => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });

    let oldPositionId = (
      await pool
        .query(
          "delete from jobposition where jobid = $1 returning PositionID",
          [req.body.id],
        )
        .then((results) => {
          return results.rows;
        })
        .catch((err) => {
          console.log(err);
        })
    ).map((i) => {
      return i.positionid;
    });

    await pool
      .query(
        `delete from position where id in (${helper.getParamsQuerry(
          oldPositionId,
        )})`,
        oldPositionId,
      )
      .then((results) => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });

    position.forEach(async (p) => {
      await pool
        .query("insert into Position(name) values ($1) returning id", [p])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobPosition(jobid, positionid) values ($1, $2)",
              [req.body.id, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });

    techskill.forEach(async (t) => {
      await pool
        .query("insert into TechSkill(name) values ($1) returning id", [t])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobTechSkill(jobid, TechSkillID) values ($1, $2)",
              [req.body.id, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });

    languageskill.forEach(async (l) => {
      await pool
        .query("insert into LanguageSkill(name) values ($1) returning id", [l])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobLanguageSkill(jobid, LanguageID) values ($1, $2)",
              [req.body.id, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    let newJobId = await pool
      .query(
        "insert into Job(CompanyID, JobTitle, Salary, Worksplace, JobDesrciption, Amount, worktime) values ($1, $2, $3, $4, $5, $6, $7) returning id",
        [id, jobtitle, salary, worksplace, jobdesrciption, amount, worktime],
      )
      .then((results) => {
        return results.rows[0].id;
      })
      .catch((err) => {
        console.log(err);
      });

    position.forEach(async (p) => {
      await pool
        .query("insert into Position(name) values ($1) returning id", [p])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobPosition(jobid, positionid) values ($1, $2)",
              [newJobId, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });

    techskill.forEach(async (t) => {
      await pool
        .query("insert into TechSkill(name) values ($1) returning id", [t])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobTechSkill(jobid, TechSkillID) values ($1, $2)",
              [newJobId, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
    languageskill.forEach(async (l) => {
      await pool
        .query("insert into LanguageSkill(name) values ($1) returning id", [l])
        .then(async (results) => {
          await pool
            .query(
              "insert into JobLanguageSkill(jobid, LanguageID) values ($1, $2)",
              [newJobId, results.rows[0].id],
            )
            .then((results) => {
              return;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
  return res.status(200).json({ status: true });
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
      .query("select * from account where email = $1 and role = 1", [email])
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

const updateCompanyProfile = async (req, res, next) => {
  const {
    address,
    description,
    field,
    logo,
    memberquantity,
    name,
    slogan,
    timeot,
    worktimeend,
    worktimestart,
    token,
  } = req.body;
  const id = jwt_decode(token).sub;
  try {
    let companyProfile = [];
    let oldProfile = await pool
      .query("select * from companycv where id = $1", [id])
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Dữ liệu không tồn tại trên hệ thống");
        error.statusCode = 303;
        throw error;
      });
    if (oldProfile.length > 0) {
      companyProfile = await pool
        .query(
          "update companycv set name = $1, address = $2, field = $3, description = $4, memberquantity = $5, worktimestart = $6, worktimeend = $7, slogan = $8, logo = $9, timeot = $10 where id = $11 returning *",
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
            id,
          ],
        )
        .then((data) => {
          return data.rows;
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(
            "Chỉnh sửa dữ liệu không thành công vui lòng kiểm tra lại !",
          );
          error.statusCode = 303;
          throw error;
        });
    } else {
      companyProfile = await pool
        .query(
          "insert into companycv (id, name, address, field, description, memberquantity, worktimestart, worktimeend, slogan, logo, timeot) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *",
          [
            id,
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
    }
    if (companyProfile.length === 0) {
      const error = new Error(
        "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
      );
      error.statusCode = 303;
      throw error;
    }
    return res.status(200).json({ status: "success", data: companyProfile[0] });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  const { token } = req.body;
  const id = jwt_decode(token).sub;
  try {
    let companyProfile = await pool
      .query("select * from companycv where id = $1", [id])
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
    return res.status(200).json({ status: "success", data: companyProfile });
  } catch (error) {
    next(error);
  }
};

const getListJob = async (req, res, next) => {
  const { token } = req.body;
  const id = jwt_decode(token).sub;
  let jobs = await pool
    .query("select * from job where companyid = $1", [id])
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

const getJob = async (req, res, next) => {
  const { id } = req.body;
  let job = await pool
    .query("select * from job where id = $1", [id])
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      console.log(err);
    });

  let jobTechSkill = await pool
    .query(
      "select name from techskill where id in (select techskillid from job, jobtechskill where job.id = jobtechskill.jobid and job.id = $1 )",
      [job[0].id],
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
      [job[0].id],
    )
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      console.log(err);
    });

  let jobPositon = await pool
    .query(
      "select name from position where id in (select positionid from job, jobposition where job.id = jobposition.jobid and job.id = $1 )",
      [job[0].id],
    )
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      console.log(err);
    });
  let techSkills = jobTechSkill.map((techSkill) => techSkill.name);
  let languageSkills = jobLanguageSkill.map(
    (languageSkill) => languageSkill.name,
  );
  let position = jobPositon.map((position) => position.name);

  job[0].techSkills = techSkills;
  job[0].languageSkills = languageSkills;
  job[0].position = position;
  job[0].id = job.id;
  return res.status(200).json(job[0]);
};

const deleteJob = async (req, res, next) => {
  const { id } = req.body;
  let oldTechSkillId = (
    await pool
      .query(
        "delete from jobtechskill where jobid = $1 returning techskillid",
        [id],
      )
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
      })
  ).map((i) => {
    return i.techskillid;
  });

  await pool
    .query(
      `delete from techskill where id in (${helper.getParamsQuerry(
        oldTechSkillId,
      )})`,
      oldTechSkillId,
    )
    .then((results) => {
      return;
    })
    .catch((err) => {
      console.log(err);
    });

  let oldLanguageSkillId = (
    await pool
      .query(
        "delete from joblanguageskill where jobid = $1 returning LanguageID",
        [id],
      )
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
      })
  ).map((i) => {
    return i.languageid;
  });

  await pool
    .query(
      `delete from languageskill where id in (${helper.getParamsQuerry(
        oldLanguageSkillId,
      )})`,
      oldLanguageSkillId,
    )
    .then((results) => {
      return;
    })
    .catch((err) => {
      console.log(err);
    });

  let oldPositionId = (
    await pool
      .query("delete from jobposition where jobid = $1 returning PositionID", [
        id,
      ])
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
      })
  ).map((i) => {
    return i.positionid;
  });

  await pool
    .query(
      `delete from position where id in (${helper.getParamsQuerry(
        oldPositionId,
      )})`,
      oldPositionId,
    )
    .then((results) => {
      return;
    })
    .catch((err) => {
      console.log(err);
    });

  await pool
    .query(`delete from job where id = $1`, [id])
    .then((results) => {
      return;
    })
    .catch((err) => {
      console.log(err);
    });
  getListJob(req, res, next);
};

const getListCV = async (req, res, next) => {
  const { id } = req.body;
  try {
    let listCV = await pool
      .query(
        `select * from CandidateCV where id in (select candidatecvid from apply where jobid = $1)`,
        [id],
      )
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });
    listCV = await Promise.all(
      listCV.map(async (cv) => {
        console.log(cv);
        let email = await pool
          .query(`select Email from account where id = $1`, [cv.candidateid])
          .then((results) => {
            return results.rows[0];
          })
          .catch((err) => {
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });

        let statusapply = await pool
          .query(`select statusapply from apply where CandidateCVID = $1`, [
            cv.id,
          ])
          .then((results) => {
            return results.rows[0];
          })
          .catch((err) => {
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        cv = { ...cv, email: email.email, status: statusapply.statusapply };
        return cv;
      }),
    );
    return res.status(200).json({ status: "success", data: listCV });
  } catch (error) {
    return next(error);
  }
};

const setPassCV = async (req, res, next) => {
  const candidatecvid = req.params.candidatecvid;
  try {
    let jobid = await pool
      .query(
        `update apply set statusapply = 1 where CandidateCVID = $1 returning jobid`,
        [candidatecvid],
      )
      .then((results) => {
        return results.rows[0].jobid;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Cập nhật dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    let emailCandidate = await pool
      .query(
        "select email from account where id in (select candidateid from candidatecv where id = $1)",
        [candidatecvid],
      )
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

    let companyname = await pool
      .query(
        "select Name from CompanyCV where id in (select companyid from job where id = $1)",
        [jobid],
      )
      .then((results) => {
        return results.rows[0].name;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    let jobTitle = await pool
      .query("select JobTitle from job where id = $1", [jobid])
      .then((results) => {
        return results.rows[0].jobtitle;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(
          "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
        );
        error.statusCode = 303;
        throw error;
      });

    helper.mailerUmat(
      emailCandidate,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
        CV đã apply vào vị trí 
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          ${jobTitle}
        </span> 
          đã được phê duyệt từ phía nhà tuyển dụng , hãy đợi phía
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          ${companyname}
        </span> 
        liên hệ với bạn !
      </p>`,
      "Thông báo từ Umat",
    );
    return getListCV(req, res, next);
  } catch (error) {
    return next(error);
  }
};

const deleteCandidateCV = async (req, res, next) => {
  const candidatecvid = req.params.candidatecvid;
  try {
    await pool
      .query(
        "delete from apply where candidatecvid = $1 returning candidatecvid",
        [candidatecvid],
      )
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Không xóa được dữ liệu trong bảng apply");
        error.statusCode = 303;
        throw error;
      });
    await pool
      .query("delete from candidatecv where id = $1", [candidatecvid])
      .then((results) => {
        return results.rows;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Không xóa được dữ liệu trong bảng apply");
        error.statusCode = 303;
        throw error;
      });
    return getListCV(req, res, next);
  } catch (error) {
    return next(error);
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
      .query("select * from account where email = $1 and role = 1", [email])
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

    helper.mailerUmat(
      email,
      `<p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;cursor: pointer;">
        Mật khẩu của bạn đã được đổi mới thành 
        <span style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;color:#ee4c50;cursor: pointer;">
          123456a@</span> 
          để bảo mật bạn nên đổi mật khẩu sau khi đăng nhập lại
      </p>`,
      "Reset Password",
    );
    return res.status(200).json({
      status: "success",
      data: { mess: "Gửi thành công !" },
    });
  } catch (error) {
    next(error);
  }
};

const changePass = async (req, res, next) => {
  // Assign a token
  const { token, oldpassword, newpassword } = req.body;
  const id = jwt_decode(token).sub;
  console.log(id);
  try {
    if (!oldpassword || !newpassword) {
      console.log(err);
      const error = new Error("Mời nhập đầy đủ thông tin!");
      error.statusCode = 303;
      throw error;
    }
    let account = await pool
      .query("select * from account where id = $1 and role = 1", [id])
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
  postJob,
  signIn,
  updateCompanyProfile,
  getProfile,
  getListJob,
  getJob,
  deleteJob,
  getListCV,
  setPassCV,
  deleteCandidateCV,
  resetPasswordMailer,
  changePass,
  checkAccount,
};
