export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  image_url: string | null;
  role: UserRole;
  created_at: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password_hash: "$2b$10$hashedpassword1",
    image_url: null,
    role: "superadmin",
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Bob Martinez",
    email: "bob.martinez@example.com",
    password_hash: "$2b$10$hashedpassword2",
    image_url: null,
    role: "admin",
    created_at: "2024-02-10T10:15:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Carol White",
    email: "carol.white@example.com",
    password_hash: "$2b$10$hashedpassword3",
    image_url: null,
    role: "user",
    created_at: "2024-02-20T14:00:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    name: "David Kim",
    email: "david.kim@example.com",
    password_hash: "$2b$10$hashedpassword4",
    image_url: null,
    role: "user",
    created_at: "2024-03-05T09:45:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    name: "Eva Rossi",
    email: "eva.rossi@example.com",
    password_hash: "$2b$10$hashedpassword5",
    image_url: null,
    role: "admin",
    created_at: "2024-03-18T11:30:00Z",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    name: "Frank Nguyen",
    email: "frank.nguyen@example.com",
    password_hash: "$2b$10$hashedpassword6",
    image_url: null,
    role: "user",
    created_at: "2024-04-02T16:20:00Z",
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    name: "Grace Lee",
    email: "grace.lee@example.com",
    password_hash: "$2b$10$hashedpassword7",
    image_url: null,
    role: "user",
    created_at: "2024-04-22T13:10:00Z",
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    name: "Henry Patel",
    email: "henry.patel@example.com",
    password_hash: "$2b$10$hashedpassword8",
    image_url: null,
    role: "user",
    created_at: "2024-05-08T08:00:00Z",
  },
  {
    id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    name: "Iris Chen",
    email: "iris.chen@example.com",
    password_hash: "$2b$10$hashedpassword9",
    image_url: null,
    role: "admin",
    created_at: "2024-05-25T15:45:00Z",
  },
  {
    id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    name: "James Walker",
    email: "james.walker@example.com",
    password_hash: "$2b$10$hashedpassword10",
    image_url: null,
    role: "user",
    created_at: "2024-06-12T12:30:00Z",
  },
  {
    id: "e1f2a3b4-c5d6-7890-efab-901234567890",
    name: "Karen Thompson",
    email: "karen.thompson@example.com",
    password_hash: "$2b$10$hashedpassword11",
    image_url: null,
    role: "user",
    created_at: "2024-06-30T10:00:00Z",
  },
  {
    id: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    name: "Liam Brooks",
    email: "liam.brooks@example.com",
    password_hash: "$2b$10$hashedpassword12",
    image_url: null,
    role: "user",
    created_at: "2024-07-15T07:30:00Z",
  },
  {
    id: "a3b4c5d6-e7f8-9012-abcd-123456789012",
    name: "Mia Santos",
    email: "mia.santos@example.com",
    password_hash: "$2b$10$hashedpassword13",
    image_url: null,
    role: "admin",
    created_at: "2024-07-28T14:15:00Z",
  },
  {
    id: "b4c5d6e7-f8a9-0123-bcde-234567890123",
    name: "Noah Davis",
    email: "noah.davis@example.com",
    password_hash: "$2b$10$hashedpassword14",
    image_url: null,
    role: "user",
    created_at: "2024-08-10T11:00:00Z",
  },
  {
    id: "c5d6e7f8-a9b0-1234-cdef-345678901234",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    password_hash: "$2b$10$hashedpassword15",
    image_url: null,
    role: "user",
    created_at: "2024-08-25T09:20:00Z",
  },
  {
    id: "d6e7f8a9-b0c1-2345-defa-456789012345",
    name: "Peter Wilson",
    email: "peter.wilson@example.com",
    password_hash: "$2b$10$hashedpassword16",
    image_url: null,
    role: "superadmin",
    created_at: "2024-09-05T16:50:00Z",
  },
  {
    id: "e7f8a9b0-c1d2-3456-efab-567890123456",
    name: "Quinn Taylor",
    email: "quinn.taylor@example.com",
    password_hash: "$2b$10$hashedpassword17",
    image_url: null,
    role: "user",
    created_at: "2024-09-18T13:40:00Z",
  },
  {
    id: "f8a9b0c1-d2e3-4567-fabc-678901234567",
    name: "Rachel Green",
    email: "rachel.green@example.com",
    password_hash: "$2b$10$hashedpassword18",
    image_url: null,
    role: "user",
    created_at: "2024-10-02T08:10:00Z",
  },
  {
    id: "a9b0c1d2-e3f4-5678-abcd-789012345678",
    name: "Samuel Harris",
    email: "samuel.harris@example.com",
    password_hash: "$2b$10$hashedpassword19",
    image_url: null,
    role: "admin",
    created_at: "2024-10-20T15:00:00Z",
  },
  {
    id: "b0c1d2e3-f4a5-6789-bcde-890123456789",
    name: "Tina Clark",
    email: "tina.clark@example.com",
    password_hash: "$2b$10$hashedpassword20",
    image_url: null,
    role: "user",
    created_at: "2024-11-08T12:00:00Z",
  },
];

export const PAGE_SIZE = 10;

export function getPaginatedUsers(
  page: number,
  source: User[] = MOCK_USERS,
): {
  users: User[];
  total: number;
  hasMore: boolean;
} {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const users = source.slice(start, end);
  return {
    users,
    total: source.length,
    hasMore: end < source.length,
  };
}
