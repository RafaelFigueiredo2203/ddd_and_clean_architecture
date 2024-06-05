import { makeAnswer } from "test/factories/make-answer"
import { makeQuestion } from "test/factories/make-question"
import { InMemoryAnswerAttachmentsRepositories } from "test/repositories/in-memory-answer-attachments-repository"
import { InMemoryAnswersRepositories } from "test/repositories/in-memory-answers-repository"
import { InMemoryNotificationRepositories } from "test/repositories/in-memory-notifications-repository"
import { InMemoryQuestionAttachmentsRepositories } from "test/repositories/in-memory-question-attachments-repository"
import { InMemoryQuestionsRepositories } from "test/repositories/in-memory-questions-repository"
import { waitFor } from "test/utils/wait-for"
import { MockInstance } from "vitest"
import { SendNotificationUseCase, SendNotificationUseCaseRequest, SendNotificationUseCaseResponse } from "../use-cases/send-notification"
import { OnQuestionBestAnswerChosen } from "./on-question-best-answer-chosen"

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepositories
let inMemoryQuestionsRepository: InMemoryQuestionsRepositories
let inMemoryAnswerAttachmentsRepositories: InMemoryAnswerAttachmentsRepositories
let inMemoryAnswersRepositories : InMemoryAnswersRepositories
let inMemoryNotificationsRepository: InMemoryNotificationRepositories
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>

describe('On Question best Answer chosen', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepositories()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepositories(
    inMemoryQuestionAttachmentsRepository,
    )
    inMemoryAnswerAttachmentsRepositories = new InMemoryAnswerAttachmentsRepositories()
    inMemoryAnswersRepositories = new InMemoryAnswersRepositories(inMemoryAnswerAttachmentsRepositories)
    inMemoryNotificationsRepository = new InMemoryNotificationRepositories()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnQuestionBestAnswerChosen(inMemoryAnswersRepositories, sendNotificationUseCase)
  })
  it('should send a notification when question has new best answer chosen' ,async () => {
    const question = makeQuestion()
    const answer = makeAnswer({ questionId: question.id })

     inMemoryQuestionsRepository.create(question)
     inMemoryAnswersRepositories.create(answer)

     question.bestAnswerId = answer.id

     inMemoryQuestionsRepository.save(question)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})