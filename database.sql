CREATE DATABASE gr1_test;

-- CREATE TABLE Account (
-- 	ID serial NOT NULL,
-- 	UserName varchar(255) NOT NULL,
-- 	Email varchar(255) NOT NULL UNIQUE,
-- 	Password varchar(255) NOT NULL,
-- 	Role integer NOT NULL,
-- 	CONSTRAINT Account_pk PRIMARY KEY (ID)
-- ) WITH (
--   OIDS=FALSE
-- );

-- ALTER account role SET DEFAULT 0;

CREATE TYPE authType AS ENUM ('local', 'google');

CREATE TABLE Account (
	ID serial NOT NULL,
	UserName varchar(255) NOT NULL,
	Email varchar(255) NOT NULL UNIQUE,
	Password varchar(255) ,
	authGoogleID varchar(255),
	Role integer NOT NULL DEFAULT 0,
	authType authType DEFAULT 'local', 
	CONSTRAINT Account_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE Job (
	ID serial NOT NULL,
	CompanyID integer NOT NULL,
	JobTitle varchar(255) NOT NULL,
	Salary varchar(255),
	Worksplace varchar(255) NOT NULL,
	JobDesrciption TEXT NOT NULL,
	Amount integer NOT NULL,
	worktime varchar(255),
	CONSTRAINT Job_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE TechSkill (
	ID serial NOT NULL,
	Name varchar(255) NOT NULL,
	CONSTRAINT TechSkill_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE JobTechSkill (
	JobID integer NOT NULL,
	TechSkillID integer NOT NULL,
	CONSTRAINT JobTechSkill_pk PRIMARY KEY (JobID,TechSkillID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE LanguageSkill (
	ID serial NOT NULL,
	Name varchar(255) NOT NULL,
	CONSTRAINT LanguageSkill_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE JobLanguageSkill (
	JobID integer NOT NULL,
	LanguageID integer NOT NULL,
	CONSTRAINT JobLanguageSkill_pk PRIMARY KEY (JobID,LanguageID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE Position (
	ID serial NOT NULL,
	Name varchar(255) NOT NULL,
	CONSTRAINT Position_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE JobPosition (
	JobID integer NOT NULL,
	PositionID integer NOT NULL,
	CONSTRAINT JobPosition_pk PRIMARY KEY (JobID,PositionID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE CompanyCV (
	ID integer NOT NULL,
	Name varchar(255) NOT NULL,
	Address varchar(255) NOT NULL,
	field TEXT NOT NULL,
	description TEXT,
	memberQuantity varchar(255) NOT NULL,
	workTimeStart varchar(255) NOT NULL,
	workTimeEnd varchar(255) NOT NULL,
	slogan varchar(255) NOT NULL,
	logo TEXT NOT NULL,
	timeOT integer NOT NULL,
	CONSTRAINT CompanyCV_pk PRIMARY KEY (ID)
) WITH (
  OIDS=FALSE
);

CREATE TABLE CandidateCV (
	ID serial NOT NULL,
	CandidateId integer NOT NULL,
	linkcv text NOT NULL,
	candidatefullname varchar(255) NOT NULL,
	phone varchar(255) NOT NULL,
	CONSTRAINT CandidateCV_pk PRIMARY KEY (id)
) WITH (
  OIDS=FALSE
);

CREATE TABLE review (
	ID serial NOT NULL,
	CandidateId integer NOT NULL,
	titlereview text NOT NULL,
	contentreview text NOT NULL,
	CompanyID integer NOT NULL,
	rate FLOAT(1) NOT NULL,
	recomment integer NOT NULL,
	CONSTRAINT review_pk PRIMARY KEY (id)
) WITH (
  OIDS=FALSE
);

CREATE TABLE apply (
	CandidateCVID integer NOT NULL,
	JobID integer NOT NULL,
	statusapply integer NOT NULL DEFAULT 0,
	CONSTRAINT apply_pk PRIMARY KEY (CandidateCVID, JobID)
) WITH (
  OIDS=FALSE
);



ALTER TABLE JobTechSkill ADD CONSTRAINT JobTechSkill_fk0 FOREIGN KEY (JobID) REFERENCES Job(ID) ON DELETE CASCADE;
ALTER TABLE JobTechSkill ADD CONSTRAINT JobTechSkill_fk1 FOREIGN KEY (TechSkillID) REFERENCES TechSkill(ID) ON DELETE CASCADE;
ALTER TABLE JobLanguageSkill ADD CONSTRAINT JobLanguageSkill_fk0 FOREIGN KEY (JobID) REFERENCES Job(ID) ON DELETE CASCADE;
ALTER TABLE JobLanguageSkill ADD CONSTRAINT JobLanguageSkill_fk1 FOREIGN KEY (LanguageID) REFERENCES LanguageSkill(ID) ON DELETE CASCADE;
ALTER TABLE Job ADD CONSTRAINT Job_fk0 FOREIGN KEY (CompanyID) REFERENCES CompanyCV(ID) ON DELETE CASCADE;
ALTER TABLE JobPosition ADD CONSTRAINT JobPosition_fk0 FOREIGN KEY (JobID) REFERENCES Job(ID) ON DELETE CASCADE;
ALTER TABLE JobPosition ADD CONSTRAINT JobPosition_fk1 FOREIGN KEY (PositionID) REFERENCES Position(ID) ON DELETE CASCADE;
ALTER TABLE CompanyCV ADD CONSTRAINT CompanyCV_fk0 FOREIGN KEY (ID) REFERENCES Account(ID) ON DELETE CASCADE; 
ALTER TABLE CandidateCV ADD CONSTRAINT CandidateCV_fk0 FOREIGN KEY (CandidateId) REFERENCES Account(ID) ON DELETE CASCADE;
ALTER TABLE apply ADD CONSTRAINT apply_fk0 FOREIGN KEY (CandidateCVID) REFERENCES CandidateCV(ID) ON DELETE CASCADE;
ALTER TABLE apply ADD CONSTRAINT apply_fk1 FOREIGN KEY (JobID) REFERENCES Job(ID) ON DELETE CASCADE;
ALTER TABLE review ADD CONSTRAINT review_fk0 FOREIGN KEY (CandidateId) REFERENCES Account(ID) ON DELETE CASCADE;
ALTER TABLE review ADD CONSTRAINT review_fk1 FOREIGN KEY (CompanyID) REFERENCES Account(ID) ON DELETE CASCADE;

ALTER TABLE JobTechSkill DROP CONSTRAINT JobTechSkill_fk0;
ALTER TABLE JobTechSkill DROP CONSTRAINT JobTechSkill_fk1;
ALTER TABLE JobLanguageSkill DROP CONSTRAINT JobLanguageSkill_fk0;
ALTER TABLE JobLanguageSkill DROP CONSTRAINT JobLanguageSkill_fk1;
ALTER TABLE JobPosition DROP CONSTRAINT JobPosition_fk0;
ALTER TABLE JobPosition DROP CONSTRAINT JobPosition_fk1;
ALTER TABLE CompanyCV DROP CONSTRAINT CompanyCV_fk0;
ALTER TABLE CandidateCV DROP CONSTRAINT CandidateCV_fk0;
ALTER TABLE apply DROP CONSTRAINT apply_fk0;
ALTER TABLE apply DROP CONSTRAINT apply_fk1;
ALTER TABLE review DROP CONSTRAINT review_fk0;
ALTER TABLE review DROP CONSTRAINT review_fk1;

ID serial NOT NULL,
	UserName varchar(255) NOT NULL,
	Email varchar(255) NOT NULL UNIQUE,
	Password varchar(255) ,
	authGoogleID varchar(255),
	Role integer NOT NULL DEFAULT 0,
	authType authType DEFAULT 'local', 
	CONSTRAINT Account_pk PRIMARY KEY (ID)

insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao1@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao2@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao3@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao4@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao5@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Thảo', 'thao6@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa1@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa2@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa3@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa4@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa5@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa6@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa7@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Hoa', 'Hoa8@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Tũn', 'tun1@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Tũn', 'tun2@gmail.com', '123456');
insert into account (username, email, password) values ('Nguyễn Phương Tũn', 'tun3@gmail.com', '123456');
