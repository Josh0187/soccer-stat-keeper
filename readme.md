Start database:
brew services start postgresql@14

Stop database:
brew services stop postgresql@14

Checkout database (after starting it):
psql soccer-stats

See if database is running:
brew services list

Reset database:
dropdb soccer_stats
createdb soccer_stats

Start python backend:
cd backend
source .venv/bin/activate
uvicorn main:app --reload
