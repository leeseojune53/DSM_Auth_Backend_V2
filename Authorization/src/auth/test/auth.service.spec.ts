import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../shared/user/entity/user.entity";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { UserService } from "../../shared/user/user.service";

class MockRepository {
  public async checkExist(identity: string): Promise<boolean> {
    if (identity === "tester") {
      return true;
    } else {
      return false;
    }
  }

  public async findOne({ where: { email } }): Promise<User> {
    if (email === "201216jjw@dsm.hs.kr") {
      return new User();
    } else if (email === "alreadysignupeamil@dsm.hs.kr") {
      const user = new User();
      user.password = "exist";
      return user;
    } else {
      undefined;
    }
  }
}

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository,
        },
      ],
      controllers: [AuthController],
    }).compile();

    service = await module.resolve<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkAllowedId", () => {
    it("should not allowed id", () => {
      service.checkAllowedId("tester").catch((err) => {
        expect(err.message).toEqual("Not Allowed ID");
        expect(err.getStatus()).toEqual(405);
      });
    });

    it("should allowed id", () => {
      service
        .checkAllowedId("not tester")
        .then(() => expect(1).toEqual(1))
        .catch(() => expect(1).toEqual(2));
    });
  });

  describe("emailAuthentication", () => {
    it("should throw not fount email error", () => {
      service.emailAuthentication("1234").catch((err) => {
        expect(err.getStatus()).toEqual(404);
        expect(err.message).toEqual("Not Found Email");
      });
    });

    it("should throw already signup error", () => {
      service
        .emailAuthentication("alreadysignupeamil@dsm.hs.kr")
        .catch((err) => {
          expect(err.getStatus()).toEqual(403);
          expect(err.message).toEqual("Already Signup");
        });
    });

    it("shoul success test", () => {
      service
        .emailAuthentication("201216jjw@dsm.hs.kr")
        .then(() => expect(1).toEqual(1))
        .catch(() => expect(1).toEqual(2));
    });
  });
});
