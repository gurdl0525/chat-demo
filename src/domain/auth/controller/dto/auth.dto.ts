import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SingUpRequest {
  @IsNotEmpty({ message: 'null일 수 없습니다.' })
  @IsString({ message: 'string 이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: (validationArguments) =>
      `${validationArguments.property} : 올바른 이메일 형식이 아닙니다.`,
  })
  account_id: string;

  @IsNotEmpty({ message: 'null일 수 없습니다.' })
  @IsString({ message: 'string 이여야 합니다.' })
  @Matches(/(?=.*[a-zA-Z]{4,})(?=.*\d{4,})(?=.*[~!@#$%^*?]+).{7,16}/, {
    message: (validationArguments) =>
      `${validationArguments.property} : 비밀번호는 영문 4자이상, 숫자 4자 이상, 특수문자 1자 이상이 포함된 7자 이상 16자 이하의 문자열입니다.`,
  })
  password: string;
}

export class LogInRequest {
  @IsString({ message: 'string 이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: (validationArguments) =>
      `${validationArguments.property} : 올바른 이메일 형식이 아닙니다.`,
  })
  account_id: string;

  @IsString({ message: 'string 이여야 합니다.' })
  @Matches(/(?=.*[a-zA-Z]{4,})(?=.*\d{4,})(?=.*[~!@#$%^*?]+).{7,16}/, {
    message: (validationArguments) =>
      `${validationArguments.property} : 비밀번호는 영문 4자이상, 숫자 4자 이상, 특수문자 1자 이상이 포함된 7자 이상 16자 이하의 문자열입니다.`,
  })
  password: string;
}

export class ReIssueRequest {
  @IsNotEmpty({ message: 'null일 수 없습니다.' })
  @IsString({ message: 'string 이여야 합니다.' })
  refresh_token: string;
}

export class TokenResponse {
  access_token: string;
  refresh_token: string;

  constructor(accessToken?: string, refreshToken?: string) {
    if (accessToken && refreshToken) {
      this.access_token = accessToken;
      this.refresh_token = refreshToken;
    }
  }
}
