import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CreateAnswerDto } from "./dto/create-answer.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { QuestionsService } from "./questions.service";

@ApiTags("questions")
@Controller({ version: API_VERSION })
export class QuestionsController {
  constructor(private questions: QuestionsService) {}

  @Public()
  @Get("products/:slug/questions")
  @ApiOperation({ summary: "List questions and answers for a product" })
  list(@Param("slug") slug: string) {
    return this.questions.listForProduct(slug);
  }

  @ApiBearerAuth()
  @Post("products/questions")
  @ApiOperation({ summary: "Ask a question about a product" })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateQuestionDto) {
    return this.questions.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @Post("products/questions/:id/answers")
  @ApiOperation({ summary: "Answer a product question" })
  answer(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.questions.answer(user.sub, id, dto.body);
  }
}
