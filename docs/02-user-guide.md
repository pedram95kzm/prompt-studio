# Using Prompt Studio

Status: **VERIFIED interface and template workflows**. Last verified: **2026-10-05**.

Prompt Studio helps you prepare instructions for an AI tool. You answer a form, generate a prompt, and paste it into the AI tool you choose. Follow-up conversations and final answers happen in that tool.

## Getting started

1. Open the application and choose a collection.
2. Select a template from the compact list. On mobile, open the **Template** selector to browse.
3. Answer fields marked `*`; expand **More context** to add optional details.
4. Choose **Response language**.
5. Select **Generate prompt**, then review **Your prompt**.
6. Select **Copy** and paste into your chosen AI conversation.
7. If you edit answers after generating, the preview clears and Copy is disabled until you generate again.

Missing required answers are highlighted and the first invalid field receives focus. Optional context opens automatically when it contains saved answers.

## Split shared expenses

Select **General → Split expenses fairly**. List everyone and their expense contributions, including zero contributors. For example:

```text
Ali: 600000
Sara: 300000
Reza: 0
```

Specify tomans/rials or another currency and the smallest payable unit if rounding matters. Leave sharing rules blank for equal shares, or describe unequal shares and expenses shared by only some people. Enter reimbursements already sent separately from expense contributions. Add transfer restrictions only if needed.

After running the prompt in an AI tool, review the fair-share table, who pays whom, transfer count, and balance check. In the example, equal shares are 300000 each, and Reza pays Ali 300000 in one transfer. The prompt asks for proof of the minimum count. If the answer says **NOT PROVEN**, it has supplied a feasible plan without establishing global optimality; ask for exact verification before treating the count as minimal.

## Find an idea

Choose **General → Discover an idea** for a broad creative/practical topic, or **Academic → Find a research idea** for a research project.

Start with the broad topic. Add a goal, background, resources, or constraints if you already know them. Run the generated prompt in the AI tool and answer its short batches of topic-specific questions. You can say you are unsure, skip an optional question, or ask it to proceed with stated assumptions.

The general workflow develops practical concepts and first experiments. The academic workflow develops research questions, methods, feasibility checks, and a proposal outline. Research novelty and gaps need evidence; a proposed idea is not proof that the literature has not covered it.

## Explore personality and relationships

Select **Psychology → Understand yourself in relationships**. Answer the four initial questions: what you want to understand, your relationship situation, your reactions to closeness/disagreement, and what you value or need. A short real example is more useful than a personality label. Optional fields allow recurring patterns, context about a particular person, and topics to avoid.

The generated prompt asks the AI to follow up based on your answers, then offer grounded observations, suitable relationship conditions, areas to practice, and concrete next steps. You can correct its interpretation or request a provisional answer sooner. It cannot establish a partner's intentions, diagnose anyone, or predict compatibility from one person's account.

**Explore personal boundaries** offers a separate workflow for needs, requests, boundary wording, and realistic follow-through. Psychology templates support reflection and communication; they do not provide diagnosis, treatment, or a validated personality test.

## Other academic tasks

- **Build a study plan:** Supply your goal, current level, and time/deadline. Add materials or assessment format to make the schedule more useful.
- **Plan a literature review:** Supply a question and any sources or excerpts available. Without accessible sources, expect a search/synthesis plan rather than completed findings. Check cited evidence and missing metadata in the downstream answer.

For all collections and purposes, see [the catalog](01-overview.md#current-catalog).

## Preferences and common tasks

| Task | How |
| --- | --- |
| Find a template | Search its name, description, or tags within the selected collection. Switch collections to search another one. |
| Set response language | Choose English, Persian, Arabic, Spanish, French, or German. Interface text stays English; Persian/Arabic previews use RTL. |
| Change appearance | Use the moon/sun button. The first visit follows your system preference. |
| Resume work | Return in the same browser and site; selections and form answers normally restore. |
| Reset one form | Use **Reset fields**; other templates' saved answers remain. |
| Remove all saved answers | Clear this site's data in browser settings. There is no global clear button. |
| Use shortcuts | `/` focuses search when not typing in a form; Ctrl+Enter (Windows/Linux) or Cmd+Enter (macOS) generates. |

## Common problems

| Symptom | Action |
| --- | --- |
| Template unavailable | Use **Try again**. If it persists, contact the maintainer. |
| Required-field error | Fill the highlighted answer and generate again. |
| Copy fails | Allow clipboard access, use HTTPS/localhost, or select and copy preview text manually. |
| Styling missing | Reload the page and check that the host serves the bundled CSS asset. Typography uses system fonts. |
| Old answers return | Reset that template or clear the site's saved data. |
| Output disappears | Generate again after changing templates/languages or refreshing. |

## Privacy, limitations, and FAQ

**Where do my answers go?** They are processed locally and automatically retained in this browser's site storage. Avoid sensitive details on shared devices. The app uses bundled styles and system fonts; the technical trust boundary is described in [security](03-architecture.md#security). Pasting a prompt into another service is a separate action governed by that service.

**Are generated answers saved?** Prompt Studio saves form values, not the generated output or an AI conversation. There is no account, shared history, or device synchronization.

**Why did an optional line disappear?** Empty optional answers remove their corresponding source line from the prompt.

**Does generation prove the result is correct?** It constructs instructions only. Check the downstream AI's calculations, sources, assumptions, and uncertainty. It does not enforce the interview, execute exact optimization, or verify academic or personal conclusions.
