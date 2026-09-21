import type { ProductQuestionDto } from "@imtiaz-mart/shared";
import { askProductQuestionAction, answerProductQuestionAction } from "@/lib/commerce/actions";

export function ProductQuestions({
  slug,
  productId,
  questions,
  canWrite,
  error,
}: {
  slug: string;
  productId: string;
  questions: ProductQuestionDto[];
  canWrite: boolean;
  error?: string;
}) {
  return (
    <section className="mt-12 border-t border-border pt-12">
      <h2 className="text-xl font-bold text-primary">Questions & answers</h2>
      {error ? (
        <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-muted">No questions yet. Ask about sizing, shipping, or how this product is used.</p>
        ) : (
          questions.map((question) => (
            <article key={question.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Question</p>
              <p className="mt-1 font-medium text-primary">{question.body}</p>
              <p className="mt-1 text-xs text-muted">
                Asked by {question.authorName}
              </p>

              <div className="mt-4 space-y-3">
                {question.answers.length === 0 ? (
                  <p className="text-sm text-muted">No answers yet.</p>
                ) : (
                  question.answers.map((answer) => (
                    <div key={answer.id} className="rounded-lg border border-border bg-background px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary">{answer.authorName}</p>
                        {answer.fromVendor ? (
                          <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                            Vendor
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{answer.body}</p>
                    </div>
                  ))
                )}
              </div>

              {canWrite ? (
                <form action={answerProductQuestionAction} className="mt-4 space-y-2">
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-primary">Your answer</span>
                    <textarea
                      name="body"
                      required
                      minLength={4}
                      rows={2}
                      className="w-full rounded-lg border border-border px-4 py-2.5"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent"
                  >
                    Post answer
                  </button>
                </form>
              ) : null}
            </article>
          ))
        )}
      </div>

      {canWrite ? (
        <form action={askProductQuestionAction} className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="slug" value={slug} />
          <h3 className="font-semibold text-primary">Ask a question</h3>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Question</span>
            <textarea
              name="body"
              required
              minLength={10}
              rows={3}
              placeholder="Does this include a charging case?"
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <button type="submit" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Submit question
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          <a href={`/login?redirect=/products/${slug}`} className="text-accent hover:underline">
            Sign in
          </a>{" "}
          to ask or answer a question.
        </p>
      )}
    </section>
  );
}
