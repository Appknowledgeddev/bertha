export type FeedbackStatus =
  | "In Review"
  | "Planned"
  | "In Progress"
  | "Completed";

export type FeedbackCategory =
  | "Feature Requests"
  | "Bugs"
  | "Product Ideas";

export type FeedbackRequest = {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory | string;
  status: FeedbackStatus | string;
  author_name: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  comments: FeedbackComment[];
};

export type FeedbackComment = {
  id: string;
  feedback_id: string;
  author_name: string;
  body: string;
  created_at: string;
};
